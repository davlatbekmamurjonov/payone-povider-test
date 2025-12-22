module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
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
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
