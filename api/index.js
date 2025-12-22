const { default: Strapi } = require('@strapi/strapi');

let strapiInstance;

const startStrapi = async () => {
  if (!strapiInstance) {
    strapiInstance = await Strapi({
      distDir: './dist',
      autoReload: false,
      serveAdminPanel: true,
    }).load();
  }
  return strapiInstance;
};

module.exports = async (req, res) => {
  try {
    const app = await startStrapi();
    app.server.app.emit('request', req, res);
  } catch (error) {
    console.error('Strapi server error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};
