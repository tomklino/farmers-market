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
  ]
}
