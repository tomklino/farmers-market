module.exports = {
  "devServer": {
    "sockHost": 'farmers.local',
    "disableHostCheck": true,
    "watchOptions": {
      "aggregateTimeout": 300,
      "poll": 1000
    },
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
