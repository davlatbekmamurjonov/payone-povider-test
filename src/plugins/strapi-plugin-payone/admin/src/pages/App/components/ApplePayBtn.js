import React, { useState, useEffect } from 'react';
import { ApplePayButton } from 'apple-pay-button';
import { Box, Typography, Alert } from '@strapi/design-system';
import { request } from '@strapi/helper-plugin';
import pluginId from '../../../pluginId';


const ApplePayBtn = ({
  amount,
  currency = 'EUR',
  countryCode = 'DE',
  onTokenReceived,
  onError,
  settings,
  buttonStyle = 'black',
  type = 'pay',
  disabled = false
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAvailability = () => {
      try {
        if (typeof window !== 'undefined' && window.ApplePaySession) {
          const canMakePayments = ApplePaySession.canMakePayments();
          console.log('[Apple Pay Button] Apple Pay available:', canMakePayments);
          setIsAvailable(canMakePayments);
        } else {
          console.log('[Apple Pay Button] Apple Pay Session not available');
          setIsAvailable(false);
        }
      } catch (error) {
        console.error('[Apple Pay Button] Error checking availability:', error);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, []);

  const handleApplePayClick = () => {
    console.log('[Apple Pay Button] ========== APPLE PAY CLICKED ==========');
    console.log('[Apple Pay Button] Amount:', amount);
    console.log('[Apple Pay Button] Currency:', currency);
    console.log('[Apple Pay Button] MerchantId:', settings?.mid);
    console.log('[Apple Pay Button] Settings:', settings);

    if (!settings?.mid) {
      const error = new Error('Merchant ID is not configured. Please set Merchant ID in plugin settings.');
      console.error('[Apple Pay Button]', error.message);
      if (onError) {
        onError(error);
      }
      return;
    }

    const amountValue = amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00';

    const applePayConfig = settings?.applePayConfig || {};
    const supportedNetworks = applePayConfig.supportedNetworks || ['visa', 'masterCard', 'amex'];
    const merchantCapabilities = applePayConfig.merchantCapabilities || ['supports3DS'];

    const applePayRequest = {
      countryCode: countryCode,
      currencyCode: currency,
      merchantCapabilities: merchantCapabilities,
      supportedNetworks: supportedNetworks,
      total: {
        label: settings?.merchantName || 'Total',
        type: 'final',
        amount: amountValue,
      }
    };

    console.log('[Apple Pay Button] Apple Pay Request:', JSON.stringify(applePayRequest, null, 2));

    const session = new ApplePaySession(3, applePayRequest);

    handleEventsForApplePay(session);

    session.begin();
  };

  const handleEventsForApplePay = (session) => {
    session.onvalidatemerchant = async (event) => {
      console.log('[Apple Pay Button] ========== MERCHANT VALIDATION ==========');
      console.log('[Apple Pay Button] Validation URL:', event.validationURL);
      console.log('[Apple Pay Button] MerchantId:', settings?.mid);

      try {
        const merchantSession = await request(`/${pluginId}/validate-apple-pay-merchant`, {
          method: 'POST',
          body: {
            validationURL: event.validationURL,
            mid: settings?.mid,
            portalid: settings?.portalid,
            domain: window.location.hostname,
            displayName: settings?.merchantName || 'Test Store'
          }
        });

        console.log('[Apple Pay Button] ========== MERCHANT SESSION RECEIVED ==========');
        console.log('[Apple Pay Button] Full response:', JSON.stringify(merchantSession, null, 2));
        console.log('[Apple Pay Button] Has data:', !!merchantSession.data);
        console.log('[Apple Pay Button] Merchant identifier:', merchantSession.data?.merchantIdentifier);
        console.log('[Apple Pay Button] Has error:', !!merchantSession.error);

        if (merchantSession.error) {
          throw new Error(merchantSession.error.message || 'Merchant validation failed');
        }

        const sessionData = merchantSession.data || merchantSession;

        if (!sessionData || !sessionData.merchantIdentifier) {
          console.error('[Apple Pay Button] Invalid merchant session:', JSON.stringify(sessionData, null, 2));
          throw new Error('Invalid merchant session: missing merchantIdentifier');
        }

        session.completeMerchantValidation(sessionData);
        console.log('[Apple Pay Button] Merchant validation completed successfully');
      } catch (error) {
        console.error('[Apple Pay Button] Merchant validation error:', error);
        if (onError) {
          onError(error);
        }
        session.completeMerchantValidation({});
      }
    };

    // Payment method selected (optional)
    session.onpaymentmethodselected = (event) => {
      console.log('[Apple Pay Button] Payment method selected');
      const update = {
        newTotal: {
          label: settings?.merchantName || 'Total',
          type: 'final',
          amount: amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00',
        }
      };
      session.completePaymentMethodSelection(update);
    };

    session.onshippingmethodselected = (event) => {
      console.log('[Apple Pay Button] Shipping method selected');
      const update = {
        newTotal: {
          label: settings?.merchantName || 'Total',
          type: 'final',
          amount: amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00',
        }
      };
      session.completeShippingMethodSelection(update);
    };

    session.onshippingcontactselected = (event) => {
      console.log('[Apple Pay Button] Shipping contact selected');
      const update = {
        newTotal: {
          label: settings?.merchantName || 'Total',
          type: 'final',
          amount: amount ? (parseFloat(amount) / 100).toFixed(2) : '0.00',
        }
      };
      session.completeShippingContactSelection(update);
    };

    session.onpaymentauthorized = async (event) => {
      console.log('[Apple Pay Button] ========== PAYMENT AUTHORIZED ==========');
      console.log('[Apple Pay Button] Payment data:', event.payment);

      try {
        const paymentData = event.payment;

        if (!paymentData || !paymentData.token) {
          console.error('[Apple Pay Button] Payment token is missing');
          const result = {
            status: ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          if (onError) {
            onError(new Error('Payment token is missing'));
          }
          return;
        }

        console.log('[Apple Pay Button] Payment token received:', {
          hasToken: !!paymentData.token,
          tokenType: typeof paymentData.token,
          tokenKeys: typeof paymentData.token === 'object' ? Object.keys(paymentData.token) : 'N/A'
        });

        // Convert token to string for Payone
        let tokenString;
        try {
          if (typeof paymentData.token === 'string') {
            tokenString = paymentData.token;
          } else {
            tokenString = JSON.stringify(paymentData.token);
          }
          // Base64 encode for Payone
          tokenString = btoa(unescape(encodeURIComponent(tokenString)));
        } catch (e) {
          console.error('[Apple Pay Button] Token encoding error:', e);
          tokenString = btoa(unescape(encodeURIComponent(JSON.stringify(paymentData.token))));
        }

        console.log('[Apple Pay Button] Token encoded, length:', tokenString.length);

        if (onTokenReceived) {
          const result = await onTokenReceived(tokenString, {
            paymentToken: paymentData.token,
            billingContact: paymentData.billingContact,
            shippingContact: paymentData.shippingContact
          });

          if (result && typeof result.then === 'function') {
            await result;
          }

          const paymentResult = {
            status: ApplePaySession.STATUS_SUCCESS,
          };
          session.completePayment(paymentResult);
          console.log('[Apple Pay Button] Payment completed successfully');
        } else {
          const paymentResult = {
            status: ApplePaySession.STATUS_SUCCESS,
          };
          session.completePayment(paymentResult);
        }
      } catch (error) {
        console.error('[Apple Pay Button] Payment error:', error);
        const result = {
          status: ApplePaySession.STATUS_FAILURE,
        };
        session.completePayment(result);
        if (onError) {
          onError(error);
        }
      }
    };

    // Session cancelled
    session.oncancel = (event) => {
      console.log('[Apple Pay Button] Session cancelled by user');
    };
  };

  if (isChecking) {
    return (
      <Box>
        <Typography variant="pi" textColor="neutral600">
          Checking Apple Pay availability...
        </Typography>
      </Box>
    );
  }

  if (!isAvailable) {
    return (
      <Box>
        <Alert closeLabel="Close" title="Apple Pay Not Available" variant="default">
          <Typography variant="pi" marginTop={2}>
            Apple Pay is not available on this device or browser. Please use a supported device (iPhone, iPad, Mac) with Safari.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!settings?.mid) {
    return (
      <Box>
        <Alert closeLabel="Close" title="Merchant ID Missing" variant="warning">
          <Typography variant="pi" marginTop={2}>
            Merchant ID is not configured. Please set Merchant ID in plugin settings.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ApplePayButton
        onClick={handleApplePayClick}
        buttonStyle={buttonStyle === 'black' || buttonStyle === 'white' || buttonStyle === 'white-outline' ? buttonStyle : 'black'}
        type={type || 'pay'}
        style={{
          width: '100%',
          borderRadius: '8px'
        }}
        disabled={disabled}
      />
      <Typography variant="pi" textColor="neutral600" style={{ fontSize: '12px', marginTop: '8px', marginRight: '6px' }}>
        ⚠️ Apple Pay does NOT work on localhost. Use a production domain with HTTPS.
      </Typography>
    </Box>
  );
};

export default ApplePayBtn;
