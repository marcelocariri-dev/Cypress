const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'https://softcomshop.meusoftcom.com.br',
    setupNodeEvents(on, config) {
      return config
    },
  },
});
