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
      <v-card
        class="mx-auto"
        max-width="600"
        >
        <v-img
          class="white--text align-end"
          height="200px"
          :src="farmer.image"
        >
          <v-card-title>{{ farmer.name }}</v-card-title>
        </v-img>
        <v-card-title v-if="typeof farmer.products !== 'undefined'">{{ farmer.products.map(p => p.name).join(" &bull; ") }}</v-card-title>
        <v-card-text>
          <v-form class="px-3" v-model="valid">
            <v-row v-for="(produce, i) in farmer.products" :key="produce.name">
              <v-layout row wrap>
                <v-flex xs12 md8>
                  <v-checkbox
                    v-model="farmer.products[i].want"
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
                      :color="farmer.products[i].quantity ? 'green' : 'light-grey'"
                      class="ma-0">{{farmer.products[i].quantity || "0"}} x {{farmer.products[i].price}}&#8362;
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
                <v-chip large>Your order total is {{orderTotal}}&#8362;</v-chip>
              </v-flex>
            </v-layout>

            <v-btn
              large
              color="success"
              v-bind:disabled="!valid || isDisabled"
              v-if="typeof displayedOrder._id === 'undefined'"
              @click="commitOrder"
              >Complete Order</v-btn>
            <v-btn
              large
              color="success"
              v-bind:disabled="!valid || isDisabled"
              v-if="typeof displayedOrder._id !== 'undefined'"
              @click="modifyOrder"
              >Modify Order</v-btn>
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
  mounted() {
    store.dispatch("setDisplayedFarmer", this.$route.params.farmer_id);

    let { loggedInUser } = store.state;
    if(loggedInUser.loggedIn && loggedInUser.email.length > 0) {
      this.email = loggedInUser.email;
    }
  },
  methods: {
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
      for(let product of this.farmer.products) {
        let orderedProduct = order.products.find(orderedProduct => orderedProduct.name === product.name);
        if(typeof orderedProduct !== "undefined") {
          product.want = true;
          product.quantity = orderedProduct.quantity;
        }
      }
    },
    setProductQuantity(i, val) {
      //NOTE due to array reactivity caveats in vue, changes to array must be done via $set - or unexpected behaviour will occur
      let product = this.farmer.products[i];
      product.quantity = val;
      this.$set(this.farmer.products, i, product);
      this.quantityChanged(i);
    },
    quantityPlus(i) {
      let quantity = Number.parseInt(this.farmer.products[i].quantity) || 0;
      this.setProductQuantity(i, quantity + 1);
    },
    quantityMinus(i) {
      let quantity = Number.parseInt(this.farmer.products[i].quantity) || 0;
      this.setProductQuantity(i, Math.max(0, quantity - 1));
    },
    wantCheckboxChanged(i) {
      if(this.farmer.products[i].want) { //ticked
        let quantity = Number.parseFloat(this.farmer.products[i].quantity);
        if(!Number.isInteger(quantity) || quantity <= 0) {
          this.setProductQuantity(i, 1);
        }
      } else { //unticked
        this.setProductQuantity(i, 0);
      }
    },
    quantityChanged(i) {
      let quantity = Number.parseFloat(this.farmer.products[i].quantity);
      if(!Number.isInteger(quantity)) {
        this.farmer.products[i].quantity = Number.parseInt(this.farmer.products[i].quantity);
      }

      if(quantity <= 0) {
        // NOTE bug in vuetify: this does not work when changing the value to negative using the arrows
        this.farmer.products[i].quantity = 0;
        this.farmer.products[i].want = false;
      } else {
        this.farmer.products[i].want = true;
      }
    },
    routeToFarmers() {
      this.$router.push("/farmers");
    },
    async modifyOrder() {
      const { name, email, phone } = this.userInfo;
      //TODO make sure userInfo contains all the above before sending

      let payload = {
        orderID: this.displayedOrder._id,
        name, email, phone,
        products: this.farmer.products.filter(p => p.want),
        farmerID: this.farmer._id
      }
      console.log(payload);

      this.isDisabled = true;
      let modifiedOrderResponse = await axios.post('/api/orders/modify', payload);
      console.log("order modified:", modifiedOrderResponse);
      this.completedDialogOpened = true;
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
        products: this.farmer.products.filter(p => p.want),
        farmerID: this.farmer._id
      }

      this.isDisabled = true;
      let newOrderResponse = await axios.post('/api/orders/new', payload);
      //TODO reflect error to user
      console.log("order submitted:", newOrderResponse);
      store.dispatch("appendUserOrder", newOrderResponse.data);
      this.completedDialogOpened = true;
    }
  },
  data: () => ({
    offerLoginDialogOpened: false,
    userInfoDialogOpened: false,
    checkbox: false,
    completedDialogOpened: false,
    isDisabled: false,
    valid: false,
    quantity: 1,
  }),
  computed: {
    ...mapState(['loggedInUser', 'userInfo']),
    userInfo: {
      get() {
        return store.state.userInfo;
      },
      set(newValue) {
        store.dispatch("setUserInfo", newValue);
      }
    },
    orderTotal() {
      if(typeof this.farmer === 'undefined' || typeof this.farmer.products === 'undefined') {
        return 0;
      }
      let sum = 0;
      this.farmer.products.forEach((p) => {
        sum += Number.parseFloat(p.price) * Number.parseInt(p.quantity || 0)
      });
      return sum;
    },
    displayedOrder() {
      return store.state.displayedOrder;
    },
    farmer() {
      return store.state.displayedFarmer;
    }
  },
  watch: {
    loggedInUser() {
      let { loggedInUser } = store.state;
      if(loggedInUser.loggedIn && loggedInUser.email.length > 0) {
        this.email = loggedInUser.email;
      }
    },
    displayedOrder() {
      if(typeof store.state.displayedOrder._id !== 'undefined' && typeof this.farmer._id !== 'undefined') {
        this.loadFromDisplayedOrder();
      } else {
        //TODO clear form
      }
    },
    farmer() {
      if(typeof store.state.displayedOrder._id !== 'undefined' && typeof this.farmer._id !== 'undefined') {
        this.loadFromDisplayedOrder();
      } else {
        //TODO clear form
      }
    }
  }
}
</script>
