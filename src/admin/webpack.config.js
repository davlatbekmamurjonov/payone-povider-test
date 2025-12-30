'use strict';

const path = require('path');

/* eslint-disable no-unused-vars */
module.exports = (config, webpack) => {
  // Add plugin node_modules to webpack resolve
  config.resolve = config.resolve || {};
  config.resolve.modules = config.resolve.modules || [];

  // Add plugin node_modules path to resolve modules
  const pluginNodeModulesPath = path.resolve(__dirname, '../plugins/strapi-plugin-payone/node_modules');
  if (!config.resolve.modules.includes(pluginNodeModulesPath)) {
    config.resolve.modules.push(pluginNodeModulesPath);
  }

  // Also ensure root node_modules is included (for apple-pay-button)
  const rootNodeModulesPath = path.resolve(__dirname, '../../node_modules');
  if (!config.resolve.modules.includes(rootNodeModulesPath)) {
    config.resolve.modules.push(rootNodeModulesPath);
  }

  // Add alias for apple-pay-button to ensure it's resolved correctly
  config.resolve.alias = config.resolve.alias || {};
  if (!config.resolve.alias['apple-pay-button']) {
    // Try plugin node_modules first, then root
    const pluginApplePayPath = path.resolve(__dirname, '../plugins/strapi-plugin-payone/node_modules/apple-pay-button');
    const rootApplePayPath = path.resolve(__dirname, '../../node_modules/apple-pay-button');
    const fs = require('fs');

    if (fs.existsSync(pluginApplePayPath)) {
      config.resolve.alias['apple-pay-button'] = pluginApplePayPath;
    } else if (fs.existsSync(rootApplePayPath)) {
      config.resolve.alias['apple-pay-button'] = rootApplePayPath;
    }
  }

  return config;
};

