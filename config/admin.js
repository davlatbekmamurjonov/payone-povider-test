module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // Content Security Policy for Apple Pay and Google Pay
  // Based on Apple Pay demo: https://applepaydemo.apple.com/
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://pay.google.com', // Google Pay SDK
        'https://applepay.cdn-apple.com', // Apple Pay SDK
        'https://www.apple.com', // Apple Pay manifest
      ],
      'script-src-elem': [
        "'self'",
        "'unsafe-inline'",
        'https://pay.google.com', // Google Pay SDK
        'https://applepay.cdn-apple.com', // Apple Pay SDK
      ],
      'connect-src': [
        "'self'",
        'https:',
        'https://pay.google.com', // Google Pay API
        'https://applepay.cdn-apple.com', // Apple Pay API
        'https://www.apple.com', // Apple Pay manifest
        'https://api.pay1.de', // Payone API
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      'media-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      'frame-src': [
        "'self'",
        'https://pay.google.com', // Google Pay iframe
        'https://applepay.cdn-apple.com', // Apple Pay iframe
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https:',
      ],
    },
  },
});
