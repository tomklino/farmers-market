import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    displayedFarmer: {},
    displayedOrder: {},
    farmersList: [],
    ordersList: [],
    loggedInUser: {
      loggedIn: false,
      username: ""
    }
  },
  mutations: {
    updateFarmers(state, farmers) {
      state.farmersList = farmers;
    },
    displayedFarmer(state, farmer) {
      state.displayedFarmer = farmer;
    },
    updateOrders(state, { orders, farmerID }) {
      let ordersFromState = state.ordersList;
      if(farmerID) {
        // if orders are for a specific farmer, remove all previous orders from
        // that farmer before merging to reflect deleted orders
        ordersFromState = ordersFromState.filter(o => o._id !== farmerID)
      }
      // merge new orders into orders in state
      orders.forEach((order) => {
        let indexInState = ordersFromState.findIndex(o => o._id === order._id)
        if (indexInState !== -1) {
          ordersFromState.splice(indexInState, 1)
        }
        ordersFromState.push(order)
      });
      state.ordersList = ordersFromState;
    },
    displayedOrder(state, order) {
      state.displayedOrder = order;
    },
    updateLoggedInUser(state, whoamiRespone) {
      if (typeof whoamiRespone.user === 'string') {
        state.loggedInUser.loggedIn = true;
        state.loggedInUser.username = whoamiRespone.user;
      } else {
        state.loggedInUser.loggedIn = false;
        state.loggedInUser.username = "";
      }
    }
  },
  actions: {
    async setDisplayedOrder({ commit, state, dispatch }, order_id) {
      let displayedOrder = state.ordersList.find(o => o._id === order_id);
      if(!displayedOrder) {
        await dispatch('fetchOrder', order_id);
        console.log("orders list", state.ordersList);
        displayedOrder = state.ordersList.find(o => o._id === order_id);
      }
      if(displayedOrder) {
        commit('displayedOrder', displayedOrder);
      }
    },
    async setDisplayedFarmer({ commit, state, dispatch }, farmer_id) {
      let displayedFarmer = state.farmersList.find(f => f._id === farmer_id);
      console.log("setting displayedFarmer", farmer_id);
      if(!displayedFarmer) {
        await dispatch('refreshFarmers');
        displayedFarmer = state.farmersList.find(f => f._id === farmer_id);
      }
      console.log("displayedFarmerObject:", displayedFarmer);
      if(displayedFarmer) {
        commit('displayedFarmer', displayedFarmer);
      }
    },
    clearDisplayedFarmer({ commit }) {
      commit('displayedFarmer', {});
    },
    clearDisplayedOrder( { commit } ){
      commit('displayedOrder', {});
    },
    async fetchOrder({ commit }, order_id) {
      let response = await axios.get(`/api/orders/byid/${order_id}`);
      console.log("got data", response.data);
      commit("updateOrders", { orders: response.data });
    },
    async refreshFarmers({ commit }) {
      let response = await axios.get("/api/farmers");
      console.log("got data:", response.data);
      commit("updateFarmers", response.data);
    },
    async fetchOrdersOfFarmer({ commit }, farmer_id) {
      let response = await axios.get(`/api/orders/${farmer_id}`);
      console.log("got data:", response.data)
      commit("updateOrders", { orders: response.data, farmerID: farmer_id });
    },
    async refreshLoggedInUser({ commit }) {
      try {
        let response = await axios.get("/users/whoami");
        console.log("got data:", response.data);
        commit("updateLoggedInUser", response.data);
      } catch(e) {
        if (e.response.status === 401) {
          commit("updateLoggedInUser", "");
        }
      }
    }
  },
  modules: {
  }
})
