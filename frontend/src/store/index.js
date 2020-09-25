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
    userInfo: {},
    loggedInUser: {
      loggedIn: false,
      username: "",
      email: "",
      admin: false,
      withGoogle: false
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
      orders.forEach((order) => { // explicitly setting the completed state of each order
        order.completed = typeof order.completed === 'undefined' ? "false" : order.completed;
      });

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
      let newLoggedInUser = {}
      if (typeof whoamiRespone.user === 'string') {
        newLoggedInUser.loggedIn = true;
        newLoggedInUser.username = whoamiRespone.user;
        newLoggedInUser.email = typeof whoamiRespone.email === "string" ? whoamiRespone.email : "";
        newLoggedInUser.admin = whoamiRespone.admin == "true";
        newLoggedInUser.withGoogle = whoamiRespone.with_google == "true";
      } else {
        newLoggedInUser.loggedIn = false;
        newLoggedInUser.username = "";
        newLoggedInUser.email = "";
        newLoggedInUser.admin = false;
        newLoggedInUser.withGoogle = false;
      }
      Vue.set(state, 'loggedInUser', newLoggedInUser);
    },
    markOrderCompleted(state, { orderID, isCompleted = "true" }) {
      state.ordersList.find(o => o._id === orderID).completed = isCompleted;
    },
    setUserInfo(state, userInfo) {
      Vue.set(state, 'userInfo', userInfo);
    }
  },
  actions: {
    clearUserInfo({ commit }) {
      localStorage.removeItem("user_info");
      commit("setUserInfo", {});
    },
    setUserInfo({ commit }, userInfo) {
      commit("setUserInfo", userInfo)
    },
    loadUserInfo({ commit, dispatch }) {
      const userInfoObjectString = localStorage.getItem("user_info");
      if(userInfoObjectString === null) {
        return dispatch('clearUserInfo');
      }
      const userInfo = JSON.parse(userInfoObjectString);
      commit("setUserInfo", userInfo);
    },
    async fetchUserInfo({ dispatch }) {
      try {
        const response = await axios.get('/users/myinfo');
        const { userInfo } = response.data;
        console.log("fetchUserInfo: user info is", userInfo);
        localStorage.setItem("user_info", JSON.stringify(userInfo));
        await dispatch("loadUserInfo");
      } catch (err) {
        console.log("error while trying to obtain user info from server", err);
      }
    },
    async persistUserInfo({ commit, state, dispatch }, userInfo) {
      const { username } = state.loggedInUser
      try {
        let response = await axios.post(`/users/update/${username}`, { userInfo });
        await dispatch("fetchUserInfo");
      } catch (err) {
        // TODO reflect error (and error type to user)
        console.log("error trying to set user info in server", err);
      }
    },
    async completeOrder({ commit }, orderID) {
      try {
        let response = await axios.post('/api/orders/complete', { orderID })
        if (response.data.message === "done") {
          commit("markOrderCompleted", { orderID });
        } else {
          console.log("unexpected response while trying to complete order", response);
        }
      } catch(err) {
        console.log("error from server while trying to complete order", err);
      }
    },
    async unCompleteOrder({ commit }, orderID) {
      try {
        let response = await axios.post('/api/orders/uncomplete', { orderID })
        if (response.data.message === "done") {
          commit("markOrderCompleted", { orderID, isCompleted: "false" });
        } else {
          console.log("unexpected response while trying to uncomplete order", response);
        }
      } catch(err) {
        console.log("error from server while trying to uncomplete order", err);
      }
    },
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
      console.log("fetchOrder got data", response.data);
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
