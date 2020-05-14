import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    farmersList: [
      {
        name: "Tzachi",
        produce: "Strawberries",
        orderMinimum: 10,
        image: require("../assets/strawberries.jpg"),
        shipmentArea: "Haruzim",
      },
      {
        name: "Oleg",
        produce: "Mangos",
        orderMinimum: 50,
        image: require("../assets/mangos.jpg"),
        shipmentArea: "Haruzim",
      },
      {
        name: "Yonni",
        produce: "Kiwis",
        orderMinimum: 20,
        image: require("../assets/kiwis.jpg"),
        shipmentArea: "Haruzim",
      }
    ]
  },
  mutations: {
    updateFarmers(state, farmers) {
      state.farmersList = farmers;
    }
  },
  actions: {
  },
  modules: {
  }
})
