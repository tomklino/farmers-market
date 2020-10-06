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
    userOrders: [],
    loggedInUser: {
      loggedIn: false,
      username: "",
      email: "",
      admin: false,
      withGoogle: false
    }
  },
  mutations: {
    setUserOrders(state, orders) {
      state.userOrders = orders;
    },
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
    updateLoggedInUser(state, loggedInUser) {
      if (loggedInUser.loggedIn) {
        Vue.set(state, 'loggedInUser', loggedInUser)
      } else {
        Vue.set(state, 'loggedInUser', {
          loggedIn: false,
          username: "",
          email: "",
          admin: false,
          withGoogle: false
        });
      }
    },
    markOrderCompleted(state, { orderID, isCompleted = "true" }) {
      state.ordersList.find(o => o._id === orderID).completed = isCompleted;
    },
    setUserInfo(state, userInfo) {
      Vue.set(state, 'userInfo', userInfo);
    }
  },
  actions: {
    async clearUserOrders({ commit }) {
      localStorage.removeItem("user_orders");
      commit("setUserOrders", []);
    },
    async appendUserOrder({ dispatch }, orderJSON) {
      const userOrdersItem = localStorage.getItem("user_orders");
      const userOrders = userOrdersItem ? JSON.parse(userOrdersItem) : [];
      const existingOrderIndex = userOrders.findIndex(o => o._id === orderJSON._id)
      if(existingOrderIndex !== -1) {
        // order exists - replacing entry
        userOrders[existingOrderIndex] = orderJSON;
      } else {
        userOrders.push(orderJSON)
      }
      localStorage.setItem("user_orders", JSON.stringify(userOrders));
      dispatch("loadUserOrders");
    },
    async fetchUserOrders({ state }) {
      const { username } = state.loggedInUser;
      const params = { username };
      try {
        const response = await axios.get(`/api/orders/byuser`, { params });
        const orders = response.status === 204 ? [] : response.data['orders'];
        localStorage.setItem("user_orders", JSON.stringify(orders));
      } catch (err) {
        //// TODO: reflect error to user
        console.log("error while trying to fetch user orders", err);
      }
    },
    loadUserOrders({ commit }) {
      const ordersLocalItem = localStorage.getItem("user_orders") || "[]";
      const orders = JSON.parse(ordersLocalItem);
      commit("setUserOrders", orders);
    },
    async refreshUserOrders({ state, dispatch }) {
      if(state.loggedInUser.loggedIn) {
        await dispatch("fetchUserOrders");
      }
      await dispatch("loadUserOrders");
    },
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
        if(typeof userInfo !== "object") {
          return localStorage.setItem("user_info", "{}");
        }
        console.log("fetchUserInfo: user info is", userInfo);
        localStorage.setItem("user_info", JSON.stringify(userInfo));
        await dispatch("loadUserInfo");
      } catch (err) {
        console.log("error while trying to obtain user info from server", err);
      }
    },
    async persistUserInfo({ state, dispatch }, userInfo) {
      const { username } = state.loggedInUser
      try {
        await axios.post(`/users/update/${username}`, { userInfo });
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
    clearDisplayedOrder({ commit }) {
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
      let response = await axios.get(`/api/orders/byfarmer/${farmer_id}`);
      console.log("got data:", response.data)
      commit("updateOrders", { orders: response.data, farmerID: farmer_id });
    },
    async logoutUser({ commit, dispatch }) {
      localStorage.removeItem("logged_in_user");
      dispatch("clearUserInfo");
      dispatch("clearUserOrders");
      commit("updateLoggedInUser", { loggedIn: false });
    },
    async loginUser({ commit }, whoamiResponeData ) {
      const loggedInUser = {};
      loggedInUser.loggedIn = true;
      loggedInUser.username = whoamiResponeData.user;
      loggedInUser.email = typeof whoamiResponeData.email === "string" ? whoamiResponeData.email : "";
      loggedInUser.admin = whoamiResponeData.admin == "true";
      loggedInUser.withGoogle = whoamiResponeData.with_google == "true";

      localStorage.setItem("logged_in_user", JSON.stringify(loggedInUser));
      commit("updateLoggedInUser", loggedInUser);
    },
    async refreshLoggedInUser({ dispatch }) {
      const loggedInUserItem = localStorage.getItem("logged_in_user");
      const loggedInUser = loggedInUserItem ? JSON.parse(loggedInUserItem) : {};
      try {
        const response = await axios.get("/users/whoami");
        dispatch("loginUser", response.data);
        await dispatch("fetchUserInfo");
      } catch(err) {
        if (err.response.status === 401) {
          if(loggedInUser.loggedIn) {
            dispatch("logoutUser");
          }
        }
      }
    }
  },
  modules: {
  }
})
