import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    displayedFarmer: {},
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
    },
    displayedFarmer(state, farmer) {
      state.displayedFarmer = farmer;
    }
  },
  actions: {
    async setDisplayedFarmer({ commit, state, dispatch }, farmer_id) {
      let displayedFarmer = state.farmersList.find(f => f._id === farmer_id);
      console.log("setting displayedFarmer", farmer_id);
      if(!displayedFarmer) {
        await dispatch('refreshFarmers');
      }
      displayedFarmer = state.farmersList.find(f => f._id === farmer_id);
      console.log("displayedFarmerObject:", displayedFarmer);
      if(displayedFarmer) {
        commit('displayedFarmer', displayedFarmer);
      }
    },
    clearDisplayedFarmer({ commit }) {
      commit('displayedFarmer', {});
    },
    async refreshFarmers(context) {
      let response = await axios.get("/api/farmers")
      console.log("got data:", response.data)
      context.commit("updateFarmers", response.data)
    }
  },
  modules: {
  }
})
