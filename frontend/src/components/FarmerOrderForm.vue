<template>
  <div>
    <v-dialog
      persistent
      v-model="offerLoginDialogOpened"
      width="500"
    >
      <OfferLogin
        @logged-in="commitOrder"
        @continue-as-guest="continueAsGuest"
      />
    </v-dialog>
    <v-dialog
      persistent
      v-model="userInfoDialogOpened"
      width="500"
    >
      <UserInfoForm
        v-model="userInfo"
        v-on:input="commitOrder"
      />
    </v-dialog>
    <v-dialog
      persistent
      v-model="completedDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>Success!</v-card-title>
        <v-card-actions>
          <v-btn
            text
            color="orange"
            @click="routeToFarmers"
            >Back To Farmers Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-container grid-list-md text-xs-center>
      <v-skeleton-loader
        v-if="loading"
        class="mx-auto"
        max-width="600"
        type="card"
      ></v-skeleton-loader>
      <v-card
        v-else
        class="mx-auto"
        max-width="600"
        >
        <v-img
          class="white--text align-end"
          height="200px"
          :src="displayedFarmer.image"
        >
          <v-card-title>{{ displayedFarmer.name }}</v-card-title>
        </v-img>
        <v-card-title v-if="typeof displayedFarmer.products !== 'undefined'">{{ displayedFarmer.products.map(p => p.name).join(" &bull; ") }}</v-card-title>
        <v-card-text>
          <v-form class="px-3" v-model="valid">
            <v-row v-for="(produce, i) in displayedFarmer.products" :key="produce.name">
              <v-layout row wrap>
                <v-flex xs12 md8>
                  <v-checkbox
                    v-model="displayedFarmer.products[i].want"
                    @change="wantCheckboxChanged(i)"
                    :label="produceLabel(produce)"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 md4>
                  <v-layout row>
                    <v-flex xs3 md3>
                      <v-btn @click="quantityMinus(i)" class="mx-2" fab dark x-small color="indigo">
                        <v-icon dark>mdi-minus</v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex xs6 md6>
                      <v-chip
                      :color="displayedFarmer.products[i].quantity ? 'green' : 'light-grey'"
                      class="ma-0">{{displayedFarmer.products[i].quantity || "0"}} x {{displayedFarmer.products[i].price}}&#8362;
                      </v-chip>
                    </v-flex>
                    <v-flex xs3 md3>
                      <v-btn @click="quantityPlus(i)" class="mx-2" fab dark x-small color="indigo">
                        <v-icon dark>mdi-plus</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-row>
            <v-layout row>
              <v-flex md12>
                <v-chip color="orange" large>Your order total is {{orderTotal}}&#8362;</v-chip>
              </v-flex>
            </v-layout>

            <v-btn
              large
              color="success"
              v-bind:disabled="completeButtonDisabled"
              @click="completeButtonClicked"
              >{{completeButtonText}}</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import store from '@/store';
import { mapState } from 'vuex';
import axios from 'axios';
import UserInfoForm from '@/components/UserInfoForm.vue';
import OfferLogin from '@/components/OfferLogin.vue';

export default {
  name: 'FarmerOrderForm',
  components: {
    UserInfoForm,
    OfferLogin
  },
  created() {
    store.dispatch("refreshUserOrders");

    let { loggedInUser } = store.state;
    if(loggedInUser.loggedIn && loggedInUser.email.length > 0) {
      this.email = loggedInUser.email;
    }
  },
  beforeDestroy() {
    store.dispatch("clearDisplayedFarmer");
    store.dispatch("clearDisplayedOrder");
  },
  methods: {
    async completeButtonClicked() {
      if(this.modifyingFlag) {
        await this.modifyOrder();
      } else {
        await this.commitOrder();
      }
    },
    isLoggedIn() {
      return store.state.loggedInUser.loggedIn;
    },
    produceLabel(produce) {
      return `${produce.name} [${produce.packageSize}${produce.packageUnit}]`
    },
    loadFromDisplayedOrder() {
      let order = store.state.displayedOrder;

      this.userInfo = {
        name: order.name,
        email: order.email,
        phone: order.phone
      }
      for(let product of this.displayedFarmer.products) {
        let orderedProduct = order.products.find(orderedProduct => orderedProduct.name === product.name);
        if(typeof orderedProduct !== "undefined") {
          this.$set(product, "want", orderedProduct.want);
          this.$set(product, "quantity", orderedProduct.quantity);
        }
      }
    },
    setProductQuantity(i, val) {
      //NOTE due to array reactivity caveats in vue, changes to array must be done via $set - or unexpected behaviour will occur
      let product = this.displayedFarmer.products[i];
      product.quantity = val;
      this.$set(this.displayedFarmer.products, i, product);
      this.quantityChanged(i);
    },
    quantityPlus(i) {
      let quantity = Number.parseInt(this.displayedFarmer.products[i].quantity) || 0;
      this.setProductQuantity(i, quantity + 1);
    },
    quantityMinus(i) {
      let quantity = Number.parseInt(this.displayedFarmer.products[i].quantity) || 0;
      this.setProductQuantity(i, Math.max(0, quantity - 1));
    },
    wantCheckboxChanged(i) {
      if(this.displayedFarmer.products[i].want) { //ticked
        let quantity = Number.parseFloat(this.displayedFarmer.products[i].quantity);
        if(!Number.isInteger(quantity) || quantity <= 0) {
          this.setProductQuantity(i, 1);
        }
      } else { //unticked
        this.setProductQuantity(i, 0);
      }
    },
    quantityChanged(i) {
      let quantity = Number.parseFloat(this.displayedFarmer.products[i].quantity);
      if(!Number.isInteger(quantity)) {
        this.displayedFarmer.products[i].quantity = Number.parseInt(this.displayedFarmer.products[i].quantity);
      }

      if(quantity <= 0) {
        // NOTE bug in vuetify: this does not work when changing the value to negative using the arrows
        this.displayedFarmer.products[i].quantity = 0;
        this.displayedFarmer.products[i].want = false;
      } else {
        this.displayedFarmer.products[i].want = true;
      }
    },
    routeToFarmers() {
      this.$router.push("/farmers");
    },
    continueAsGuest() {
      this.offerLoginDialogOpened = false;
      this.userInfoDialogOpened = true;
    },
    closeAllDialogs() {
      this.offerLoginDialogOpened = false;
      this.userInfoDialogOpened = false;
    },
    async commitOrder() {
      this.closeAllDialogs();

      if(this.isLoggedIn()) {
        await store.dispatch("loadUserInfo"); //load from local storage to state
      }
      const { name, email, phone } = this.userInfo;
      if(!(name && email && phone)) {
        if(!this.isLoggedIn()) {
          this.offerLoginDialogOpened = true;
          return;
        }
        this.userInfoDialogOpened = true;
        return;
      }

      let payload = {
        name, email, phone,
        products: this.displayedFarmer.products.filter(p => p.want),
        farmerID: this.displayedFarmer._id
      }

      this.isDisabled = true;
      let newOrderResponse = await axios.post('/api/orders/new', payload);
      //TODO reflect error to user
      store.dispatch("appendUserOrder", newOrderResponse.data);
      this.completedDialogOpened = true;
    },
    async modifyOrder() {
      const { name, email, phone } = this.userInfo;
      //TODO make sure userInfo contains all the above before sending

      let payload = {
        orderID: this.displayedOrder._id,
        name, email, phone,
        products: this.displayedFarmer.products.filter(p => p.want),
        farmerID: this.displayedFarmer._id
      }

      this.isDisabled = true;
      try {
        const modifiedOrderResponse = await axios.post('/api/orders/modify', payload);
        store.dispatch("appendUserOrder", modifiedOrderResponse.data);
        this.completedDialogOpened = true;
      } catch (err) {
        if(err.response.status === 423) {
          console.log("farmer is locked for orders");
        } else {
          console.log("unknown error when trying to modify");
        }
      }
    }
  },
  data: () => ({
    offerLoginDialogOpened: false,
    userInfoDialogOpened: false,
    checkbox: false,
    completedDialogOpened: false,
    valid: false,
    quantity: 1,
  }),
  computed: {
    ...mapState([
      'loggedInUser', 'userInfo', 'userOrders', 'displayedFarmer', 'displayedOrder',
    ]),
    completeButtonDisabled() {
      return this.displayedFarmer.products.every(p => p.want !== true) ||
             (this.displayedFarmer.orderLock === 'true') ||
             (this.displayedOrder.completed === 'true');
    },
    modifyingFlag() {
      return Object.keys(this.displayedOrder).length !== 0;
    },
    completeButtonText() {
      if(this.displayedFarmer.orderLock === 'true') {
        return "closed for orders"
      }
      if(this.displayedOrder.completed === 'true') {
        return "order delivered"
      }
      return this.modifyingFlag ? "modify order" : "complete order";
    },
    loading() {
      let { loadingDisplayedFarmer, loadingDisplayedOrder, loadingUserOrders } = store.state;
      return loadingDisplayedFarmer || loadingDisplayedOrder || loadingUserOrders;
    },
    userInfo: {
      get() {
        return store.state.userInfo;
      },
      set(newValue) {
        store.dispatch("setUserInfo", newValue);
      }
    },
    orderTotal() {
      if(typeof this.displayedFarmer === 'undefined' || typeof this.displayedFarmer.products === 'undefined') {
        return 0;
      }
      let sum = 0;
      this.displayedFarmer.products.forEach((p) => {
        sum += Number.parseFloat(p.price) * Number.parseInt(p.quantity || 0)
      });
      return sum;
    }
  },
  watch: {
    async userOrders() {
      const foundOrder = this.userOrders.find(o => o.farmerID === this.$route.params.farmer_id);
      if(typeof foundOrder === 'object') {
        await store.dispatch('setDisplayedOrder', foundOrder._id);
        this.loadFromDisplayedOrder();
      }
    },
    loggedInUser() {
      let { loggedInUser } = store.state;
      if(loggedInUser.loggedIn && loggedInUser.email.length > 0) {
        this.email = loggedInUser.email;
      }
    },
    displayedOrder() {
      if(typeof store.state.displayedOrder._id !== 'undefined' && typeof this.displayedFarmer._id !== 'undefined') {
        this.loadFromDisplayedOrder();
      } else {
        //TODO clear form
      }
    },
    displayedFarmer() {
      if(typeof store.state.displayedOrder._id !== 'undefined' && typeof this.displayedFarmer._id !== 'undefined') {
        this.loadFromDisplayedOrder();
      } else {
        //TODO clear form
      }
    }
  }
}
</script>
