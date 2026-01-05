"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { getSettings, validateSettings } = require("./settingsService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

const parseResponse = (responseData) => {
  if (typeof responseData === 'string') {
    const params = new URLSearchParams(responseData);
    const parsed = {};
    for (const [key, value] of params.entries()) {
      parsed[key] = value;
    }
    return parsed;
  }
  return responseData;
};

const initializeApplePaySession = async (strapi, params) => {
  let settings = null;
  try {
    settings = await getSettings(strapi);

    const mode = (settings.mode || "test").toLowerCase();
    if (mode !== "live") {
      strapi.log.warn("[Apple Pay] Mode is not 'live'. Apple Pay only works in live mode.");
    }

    const applePayConfig = settings?.applePayConfig || {};
    const currency = params.currency || applePayConfig.currencyCode || "EUR";
    const countryCode = params.countryCode || applePayConfig.countryCode || "DE";

    const merchantName = params.displayName || settings?.merchantName || "Store";
    const domain = params.domain || params.domainName || "localhost";

    strapi.log.info("[Apple Pay] Building request with:", {
      currency,
      countryCode,
      merchantName,
      domain,
      mid: settings.mid,
      aid: settings.aid,
      portalid: settings.portalid,
      mode: settings.mode,
      hasKey: !!(settings.key || settings.portalKey)
    });

    const baseParams = {
      request: "genericpayment",
      clearingtype: "wlt",
      wallettype: "APL",
      currency: currency,
      "add_paydata[action]": "init_applepay_session",
      "add_paydata[display_name]": merchantName,
      "add_paydata[domain_name]": domain
    };

    const requestParams = buildClientRequestParams(settings, baseParams, strapi.log);

    const logParams = { ...requestParams };
    if (logParams.key) {
      logParams.key = "***HIDDEN***";
    }
    strapi.log.info("[Apple Pay] Request params:", logParams);

    const formData = toFormData(requestParams);

    strapi.log.info("[Apple Pay] Sending request to Payone:", {
      url: `${POST_GATEWAY_URL}Genericpayment`,
      method: "POST"
    });

    const response = await axios.post(`${POST_GATEWAY_URL}Genericpayment`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    strapi.log.info("[Apple Pay] Payone response status:", response.status);
    strapi.log.info("[Apple Pay] Payone response headers:", response.headers);

    const responseData = parseResponse(response.data);

    strapi.log.info("[Apple Pay] Payone response data:", {
      status: responseData.status,
      errorcode: responseData.errorcode || responseData.ErrorCode,
      errormessage: responseData.errormessage || responseData.ErrorMessage,
      hasApplePaySession: !!(responseData["add_paydata[applepay_payment_session]"] || responseData.add_paydata?.applepay_payment_session)
    });

    if (responseData.errorcode || responseData.ErrorCode) {
      strapi.log.error("[Apple Pay] Payone error:", {
        errorcode: responseData.errorcode || responseData.ErrorCode,
        errormessage: responseData.errormessage || responseData.ErrorMessage,
        customermessage: responseData.customermessage || responseData.CustomerMessage
      });
    }

    return responseData;
  } catch (error) {
    strapi.log.error("[Apple Pay] Session initialization error:", {
      message: error.message,
      stack: error.stack,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method
    });

    // Provide more specific error messages
    if (error.response?.status === 403) {
      const responseData = parseResponse(error.response.data);
      const errorCode = responseData.errorcode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.ErrorMessage || responseData.customermessage || responseData.CustomerMessage;

      strapi.log.error("[Apple Pay] 403 Forbidden from Payone:", {
        errorcode: errorCode,
        errormessage: errorMessage,
        requestParams: {
          mid: settings?.mid || "unknown",
          aid: settings?.aid || "unknown",
          portalid: settings?.portalid || "unknown",
          mode: settings?.mode || "unknown",
          domain: params?.domain || params?.domainName || "unknown",
          displayName: params?.displayName || settings?.merchantName || "unknown"
        }
      });

      let detailedMessage = "403 Forbidden: Authentication failed with Payone API. ";

      if (errorCode) {
        detailedMessage += `Error Code: ${errorCode}. `;
      }

      if (errorMessage) {
        detailedMessage += `Error: ${errorMessage}. `;
      }

      detailedMessage += "Please check:\n" +
        "1. Your Payone credentials (aid, portalid, mid, key) in plugin settings\n" +
        "2. Mode is set to 'live' (Apple Pay only works in live mode according to Payone docs)\n" +
        "3. Your domain is registered with Payone Merchant Services\n" +
        "4. Merchant ID (mid) matches your merchantIdentifier in PMI\n" +
        "5. Apple Pay is enabled for your portal in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab)";

      throw new Error(detailedMessage);
    } else if (error.response?.status === 401) {
      strapi.log.error("[Apple Pay] 401 Unauthorized from Payone:", {
        requestParams: {
          mid: settings?.mid || "unknown",
          aid: settings?.aid || "unknown",
          portalid: settings?.portalid || "unknown",
          mode: settings?.mode || "unknown"
        }
      });
      throw new Error("401 Unauthorized: Invalid credentials. Please verify your Payone key in plugin settings.");
    } else if (error.response?.status >= 500) {
      strapi.log.error("[Apple Pay] Payone server error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        responseData: error.response.data
      });
      throw new Error(`Payone server error (${error.response.status}): ${error.response.statusText || 'Internal server error'}`);
    }

    throw error;
  }
};

const validateApplePayMerchant = async (strapi, params) => {
  try {
    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      strapi.log.error("[Apple Pay] Payone settings not configured");
      throw new Error("Payone settings are not properly configured. Please check your plugin settings (aid, portalid, mid, key).");
    }

    // Get currency and country from Apple Pay config
    const applePayConfig = settings?.applePayConfig || {};
    const currency = params.currency || applePayConfig.currencyCode || "EUR";
    const countryCode = params.countryCode || applePayConfig.countryCode || "DE";

    // Update params with config values
    if (!params.currency && applePayConfig.currencyCode) {
      params.currency = applePayConfig.currencyCode;
    }
    if (!params.countryCode && applePayConfig.countryCode) {
      params.countryCode = applePayConfig.countryCode;
    }

    strapi.log.info("[Apple Pay] Initializing session with params:", {
      domain: params.domain || params.domainName,
      displayName: params.displayName,
      currency: currency,
      countryCode: countryCode,
      applePayConfig: {
        currencyCode: applePayConfig.currencyCode,
        countryCode: applePayConfig.countryCode
      }
    });

    const sessionResponse = await initializeApplePaySession(strapi, params);

    strapi.log.info("[Apple Pay] Payone response:", {
      status: sessionResponse.status,
      errorcode: sessionResponse.errorcode || sessionResponse.ErrorCode,
      errormessage: sessionResponse.errormessage || sessionResponse.ErrorMessage,
      hasApplePaySession: !!(sessionResponse["add_paydata[applepay_payment_session]"] || sessionResponse.add_paydata?.applepay_payment_session)
    });

    const applePaySessionBase64 = sessionResponse["add_paydata[applepay_payment_session]"] ||
      sessionResponse.add_paydata?.applepay_payment_session;

    if (sessionResponse.status === "OK" && applePaySessionBase64 && applePaySessionBase64.length > 0) {
      try {
        const merchantSessionJson = Buffer.from(applePaySessionBase64, 'base64').toString('utf-8');
        const merchantSession = JSON.parse(merchantSessionJson);

        if (merchantSession.epochTimestamp && merchantSession.epochTimestamp > 1000000000000) {
          merchantSession.epochTimestamp = Math.floor(merchantSession.epochTimestamp / 1000);
        }

        if (merchantSession.expiresAt && merchantSession.expiresAt > 1000000000000) {
          merchantSession.expiresAt = Math.floor(merchantSession.expiresAt / 1000);
        }

        // Ensure merchantIdentifier is set from settings if missing
        if (!merchantSession.merchantIdentifier ||
          merchantSession.merchantIdentifier === 'undefined' ||
          merchantSession.merchantIdentifier === 'null') {
          strapi.log.warn("[Apple Pay] Decoded merchant session has invalid merchantIdentifier, using settings.mid");
          merchantSession.merchantIdentifier = settings.mid || settings.merchantIdentifier || settings.portalid;
        }

        if (!merchantSession.merchantIdentifier) {
          throw new Error("Merchant identifier is missing. Please configure Merchant ID (mid) in plugin settings.");
        }

        strapi.log.info("[Apple Pay] Merchant session decoded successfully:", {
          merchantIdentifier: merchantSession.merchantIdentifier,
          domainName: merchantSession.domainName,
          displayName: merchantSession.displayName
        });

        return merchantSession;
      } catch (parseError) {
        strapi.log.error("[Apple Pay] Error parsing merchant session:", {
          message: parseError.message,
          stack: parseError.stack
        });
        throw new Error(`Failed to parse merchant session from Payone: ${parseError.message}`);
      }
    }

    const errorCode = sessionResponse.errorcode || sessionResponse.ErrorCode;
    const errorMessage = sessionResponse.errormessage || sessionResponse.ErrorMessage ||
      sessionResponse.errortxt || sessionResponse.ErrorTxt;

    strapi.log.error(
      `[Apple Pay] Payone Apple Pay initialization failed: ${errorCode ? `Error ${errorCode}` : ''} ${errorMessage || 'Unknown error'}`
    );

    throw new Error(
      `Payone Apple Pay initialization failed: ${errorCode ? `Error ${errorCode}` : 'Unknown error'} - ${errorMessage || 'Please check your Payone Apple Pay configuration in PMI'}`
    );
  } catch (error) {
    strapi.log.error("[Apple Pay] validateApplePayMerchant error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

module.exports = {
  initializeApplePaySession,
  validateApplePayMerchant
};
