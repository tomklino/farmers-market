import Vue from 'vue'
import Vuex from 'vuex'
import i18n from '../i18n'
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    message: {
      title: "",
      content: ""
    },
    messageDialogOpened: false,
    displayedFarmer: {
      // NOTE if something changes here - change the action clearDisplayedFarmer as well
      name: "",
      description: "",
      shipmentArea: "",
      paymentLink: "",
      owner: "",
      image: "",
      orderMinimum: 0,
      arrivalDates: [],
      products: []
    },
    loadingDisplayedFarmer: false,
    displayedOrder: {},
    loadingDisplayedOrder: false,
    sendingOrderToServer: false,
    farmersList: [],
    ordersList: [],
    userInfo: {
      // NOTE if something changes here - change in action clearUserInfo as well
      name: "",
      email: "",
      phone: ""
    },
    userOrders: [],
    loadingUserOrders: false,
    loggedInUser: {
      loggedIn: false,
      username: "",
      email: "",
      admin: false,
      withGoogle: false
    }
  },
  mutations: {
    removeDisplayedFarmerProduct(state, index) {
      state.displayedFarmer.products.splice(index, 1);
    },
    setMessage(state, { title, content }) {
      state.message.title = title;
      state.message.content = content
    },
    setMessageDialogOpened(state, isOpened) {
      state.messageDialogOpened = isOpened;
    },
    setDisplayedFarmerAttribute(state, attribute) {
      Vue.set(state.displayedFarmer, attribute.key, attribute.value);
    },
    setDates(state, dates) {
      Vue.set(state.displayedFarmer, 'arrivalDates', dates);
    },
    setFarmerLoading(state, { farmerID, isLoading }) {
      let farmer = state.farmersList.find(f => f._id === farmerID);
      Vue.set(farmer, "isLoading", isLoading);
    },
    setLoadingDisplayedFarmer(state, isLoading) {
      state.loadingDisplayedFarmer = isLoading;
    },
    setLoadingDisplayedOrder(state, isLoading) {
      state.loadingDisplayedOrder = isLoading;
    },
    setLoadingUserOrders(state, isLoading) {
      state.loadingUserOrders = isLoading;
    },
    setSendingOrderToServer(state, isSending) {
      state.sendingOrderToServer = isSending;
    },
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
        ordersFromState = ordersFromState.filter(o => o._id !== farmerID);
      }
      // merge new orders into orders in state
      orders.forEach((order) => {
        let indexInState = ordersFromState.findIndex(o => o._id === order._id);
        if (indexInState !== -1) {
          ordersFromState.splice(indexInState, 1);
        }
        ordersFromState.push(order);
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
    markOrderPayed(state, { orderID, isPayed = "true" }) {
      const indexOfOrder = state.ordersList.findIndex(o => o._id === orderID);
      const order = state.ordersList[indexOfOrder];
      order.payed = isPayed;
      Vue.set(state.ordersList, indexOfOrder, order);
    },
    markOrderCompleted(state, { orderID, isCompleted = "true" }) {
      state.ordersList.find(o => o._id === orderID).completed = isCompleted;
    },
    setUserInfo(state, userInfo) {
      Vue.set(state, 'userInfo', userInfo);
    },
    setUserInfoAttribute(state, attribute) {
      Vue.set(state.userInfo, attribute.key, attribute.value)
    }
  },
  actions: {
    async cancelDisplayedOrder({ state, dispatch }) {
      const orderID = state.displayedOrder._id;

      try {
        await axios.put(`/api/orders/cancel/${orderID}`);
        await dispatch("refreshUserOrders");
      } catch (err) {
        dispatch("setMessage", {
          title: i18n.t("error"),
          content: i18n.t("could_not_cancel_order")
        })
      }
    },
    setMessage({ commit }, message) {
      commit("setMessage", message);
      commit("setMessageDialogOpened", true);
    },
    setMessageDialogOpened({ commit }, isOpened) {
      commit("setMessageDialogOpened", isOpened);
    },
    setDisplayedFarmerName({ commit }, name) {
      commit('setDisplayedFarmerAttribute', { key: 'name', value: name });
    },
    setDisplayedFarmerDescription({ commit }, description) {
      commit('setDisplayedFarmerAttribute', { key: 'description', value: description });
    },
    setDisplayedShipmentArea({ commit }, shipmentArea) {
      commit('setDisplayedFarmerAttribute', { key: 'shipmentArea', value: shipmentArea });
    },
    setDisplayedFarmerPaymentLink({ commit }, paymentLink) {
      commit('setDisplayedFarmerAttribute', { key: 'paymentLink', value: paymentLink });
    },
    setDisplayedFarmerOwner({ commit }, owner) {
      commit('setDisplayedFarmerAttribute', { key: 'owner', value: owner });
    },
    setDisplayedFarmerOrderMinimum({ commit }, orderMinimum) {
      commit('setDisplayedFarmerAttribute', { key: 'orderMinimum', value: orderMinimum });
    },
    setDisplayedFarmerArrivalDates({ commit }, dates) {
      commit('setDisplayedFarmerAttribute', { key: 'arrivalDates', value: dates })
    },
    setSendingOrderToServer({ commit }, isSending) {
      commit('setSendingOrderToServer', isSending);
    },
    async markOrderAsPayed({ commit }, orderID) {
      try {
        let response = await axios.post('/api/orders/markpayed', { orderID })
        if (response.data.message === "done") {
          commit("markOrderPayed", { orderID });
        } else {
          //TODO reflect error to user
        }
      } catch(err) {
        //TODO reflect error to user
      }
    },
    async unmarkOrderAsPayed({ commit }, orderID) {
      try {
        let response = await axios.post('/api/orders/unmarkpayed', { orderID })
        if (response.data.message === "done") {
          commit("markOrderPayed", { orderID, isPayed: "false" });
        } else {
          // TODO: reflect error to user
        }
      } catch(err) {
        // TODO: reflect error to user
      }
    },
    async unlockOrders({ commit, dispatch }, farmerID) {
      commit("setFarmerLoading", { farmerID, isLoading: true });
      try {
        await axios.put(`/api/farmers/unlockorders/${farmerID}`);
        await dispatch('refreshFarmers');
      } catch (err) {
        // TODO reflect error to user
      } finally {
        commit("setFarmerLoading", { farmerID, isLoading: false });
      }
    },
    async lockOrders({ commit, dispatch }, farmerID) {
      commit("setFarmerLoading", { farmerID, isLoading: true });
      try {
        await axios.put(`/api/farmers/lockorders/${farmerID}`);
        await dispatch('refreshFarmers');
      } catch (err) {
        // TODO reflect error to user
      } finally {
        commit("setFarmerLoading", { farmerID, isLoading: false });
      }
    },
    async clearUserOrders({ commit }) {
      localStorage.removeItem("user_orders");
      commit("setUserOrders", []);
    },
    async appendUserOrder({ dispatch, commit }, orderJSON) {
      const userOrdersItem = localStorage.getItem("user_orders");
      const userOrders = userOrdersItem ? JSON.parse(userOrdersItem) : [];
      const existingOrderIndex = userOrders.findIndex(o => o._id === orderJSON._id)
      if(existingOrderIndex !== -1) {
        // order exists - replacing entry
        userOrders[existingOrderIndex] = orderJSON;
      } else {
        userOrders.push(orderJSON)
      }
      commit("updateOrders", { orders: [ orderJSON ]});
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
      }
    },
    loadUserOrders({ commit }) {
      const ordersLocalItem = localStorage.getItem("user_orders") || "[]";
      const orders = JSON.parse(ordersLocalItem);
      commit("setUserOrders", orders);
    },
    async refreshUserOrders({ commit, state, dispatch }) {
      if(state.loggedInUser.loggedIn) {
        commit("setLoadingUserOrders", true);
        await dispatch("fetchUserOrders");
        commit("setLoadingUserOrders", false)
      }
      dispatch("loadUserOrders");
    },
    clearUserInfo({ commit }) {
      localStorage.removeItem("user_info");
      commit("setUserInfo", {
        name: "",
        email: "",
        phone: ""
      });
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
        localStorage.setItem("user_info", JSON.stringify(userInfo));
        await dispatch("loadUserInfo");
      } catch (err) {
        //TODO reflect error to user
      }
    },
    async persistUserInfo({ state, dispatch }, userInfo) {
      const { username } = state.loggedInUser
      try {
        await axios.post(`/users/update/${username}`, { userInfo });
        await dispatch("fetchUserInfo");
      } catch (err) {
        // TODO reflect error (and error type to user)
      }
    },
    async completeOrder({ commit }, orderID) {
      try {
        let response = await axios.post('/api/orders/complete', { orderID })
        if (response.data.message === "done") {
          commit("markOrderCompleted", { orderID });
        } else {
          //TODO reflect error to user
        }
      } catch(err) {
        //TODO reflect error to user
      }
    },
    async unCompleteOrder({ commit }, orderID) {
      try {
        let response = await axios.post('/api/orders/uncomplete', { orderID })
        if (response.data.message === "done") {
          commit("markOrderCompleted", { orderID, isCompleted: "false" });
        } else {
          // TODO: reflect error to user
        }
      } catch(err) {
        // TODO: reflect error to user
      }
    },
    pushToDisplayedOrder({ commit }, orderJSON) {
      commit('displayedOrder', orderJSON);
    },
    async setDisplayedOrder({ commit, state, dispatch }, order_id) {
      let displayedOrder = state.ordersList.find(o => o._id === order_id);
      if(!displayedOrder) {
        commit('setLoadingDisplayedOrder', true);
        await dispatch('fetchOrder', order_id);
        commit('setLoadingDisplayedOrder', false);
        displayedOrder = state.ordersList.find(o => o._id === order_id);
      }
      if(displayedOrder) {
        commit('displayedOrder', displayedOrder);
      }
    },
    async setDisplayedFarmer({ commit, state, dispatch }, farmer_id) {
      let displayedFarmer = state.farmersList.find(f => f._id === farmer_id);
      if(!displayedFarmer) {
        commit('setLoadingDisplayedFarmer', true);
        await dispatch('refreshFarmers');
        commit('setLoadingDisplayedFarmer', false);
        displayedFarmer = state.farmersList.find(f => f._id === farmer_id);
      }
      if(displayedFarmer) {
        commit('displayedFarmer', displayedFarmer);
      }
    },
    clearDisplayedFarmer({ commit }) {
      commit('displayedFarmer', {
        name: "",
        description: "",
        shipmentArea: "",
        paymentLink: "",
        owner: "",
        orderMinimum: 0,
        arrivalDates: [],
        products: []
      });
    },
    clearDisplayedOrder({ commit }) {
      commit('displayedOrder', {});
    },
    async fetchOrder({ commit }, order_id) {
      const response = await axios.get(`/api/orders/byid/${order_id}`);
      commit("updateOrders", { orders: response.data });
    },
    async refreshFarmers({ commit }) {
      const response = await axios.get("/api/farmers");
      commit("updateFarmers", response.data);
    },
    async fetchOrdersOfFarmer({ commit }, farmer_id) {
      const response = await axios.get(`/api/orders/byfarmer/${farmer_id}`);
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
    },
    async createFarmer({ state, commit, dispatch }) {
      commit('setLoadingDisplayedFarmer', true);
      try {
        await axios.post('/api/farmers', state.displayedFarmer)
      } catch (err) {
        dispatch('setMessage', { title: "Error", content: "failed to create farmer" });
        return false;
      } finally {
        commit('setLoadingDisplayedFarmer', false);
      }
      return true;
    },
    async modifyFarmer({ state, commit, dispatch }) {
      commit('setLoadingDisplayedFarmer', true);
      try {
        await axios.put(`/api/farmers/${state.displayedFarmer._id}`, state.displayedFarmer);
      } catch (err) {
        console.log("Error while trhing to edit farmer", err);
        dispatch('setMessage', { title: "Error", content: "failed to modify farmer" });
        return false;
      } finally {
        commit('setLoadingDisplayedFarmer', false);
      }
      return true;

    }
  },
  modules: {
  }
})
