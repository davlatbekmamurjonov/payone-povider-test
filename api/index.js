const { default: Strapi } = require('@strapi/strapi');

let strapiInstance;

const startStrapi = async () => {
  if (!strapiInstance) {
    try {
      console.log('Starting Strapi...');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('Working directory:', process.cwd());

      strapiInstance = await Strapi({
        distDir: './dist',
        autoReload: false,
        serveAdminPanel: true,
      }).load();

      console.log('Strapi loaded successfully');
    } catch (error) {
      console.error('Failed to load Strapi:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
  return strapiInstance;
};

module.exports = async (req, res) => {
  try {
    const app = await startStrapi();

    if (!app || !app.server || !app.server.app) {
      throw new Error('Strapi app or server not initialized');
    }

    const handler = app.server.app.callback();
    return handler(req, res);

  } catch (error) {
    console.error('Strapi server error:', error);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        url: req.url,
        method: req.method
      });
    }
  }
};
