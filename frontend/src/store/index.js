import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    displayedFarmer: {},
    farmersList: [],
    ordersList: []
  },
  mutations: {
    updateFarmers(state, farmers) {
      state.farmersList = farmers;
    },
    displayedFarmer(state, farmer) {
      state.displayedFarmer = farmer;
    },
    updateOrders(state, orders) {
      let ordersFromState = state.ordersList;
      // merge new orders into orders in state
      orders.forEach((order) => {
        let indexInState = ordersFromState.findIndex(o => o._id === order._id)
        if (indexInState !== -1) {
          ordersFromState.splice(indexInState, 1)
        }
        ordersFromState.push(order)
      });
      state.ordersList = ordersFromState;
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
    },
    async fetchOrdersOfFarmer({ commit }, farmer_id) {
      let response = await axios.get(`/api/orders/${farmer_id}`);
      console.log("got data:", response.data)
      commit("updateOrders", response.data);
    }
  },
  modules: {
  }
})
