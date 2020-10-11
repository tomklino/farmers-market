module.exports = {
  "devServer": {
    "public": 'farmers.local',
    "disableHostCheck": true,
    "watchOptions": {
      "aggregateTimeout": 300,
      "poll": 1000
    },
  },

  "transpileDependencies": [
    "vuetify"
  ],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
