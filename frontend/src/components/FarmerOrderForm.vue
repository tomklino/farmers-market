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
        v-on:input="sendOrder"
      />
    </v-dialog>
    <v-dialog
      v-model="completedDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>{{ $t('your_order_has_been_registered') }}</v-card-title>
        <v-card-text>
          <div>
            {{ $t('your_order_total_is') }} {{ orderTotal }}&#8362;
          </div>
          <div v-if="typeof displayedFarmer.paymentLink === 'string' && displayedFarmer.paymentLink.length > 0">
            {{ $t('please_remember_to_pay_at') }}
            <a target="_blank" :href="displayedFarmer.paymentLink.length > 0 ? displayedFarmer.paymentLink : ''">
              {{displayedFarmer.paymentLink.length > 0 ? displayedFarmer.paymentLink : ''}}
            </a>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text
            color="orange"
            @click="routeToFarmers"
            >{{ $t('back_to_farmers_page') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="orderSummaryDialogOpened"
      @input="(v) => !v && notApproved()"
      width="500">
      <OrderSummary
        v-model="orderSummaryDialogOpened"
        @input="(v) => !v && notApproved()"
        disableGoToOrderButton=true
        :closeButtonText="$t('i_am_not_done')"
        :approveButtonText="$t('looks_good')"
        v-on:approved="approve()"
      />
    </v-dialog>
    <v-dialog
      width="500"
      :persistent="cancelButtonsLoading"
      v-model="verifyCancellationDialogOpened">
      <v-card width="100%">
        <v-card-title>{{ $t("are_you_sure_you_want_to_cancel_order") }}</v-card-title>
        <v-card-actions>
          <v-btn
            color="grey-lighten-2"
            class="ma-2"
            :disabled="cancelButtonsLoading"
            @click="verifyCancellationDialogOpened = false"
          >{{ $t("no_cancel_order") }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            class="ma-2"
            :loading="cancelButtonsLoading"
            :disabled="cancelButtonsLoading"
            @click="cancelOrder()"
          >{{ $t("yes_cancel_order") }}</v-btn>
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
          <v-card-title class="subtitle" v-if="displayedFarmer.products instanceof Array">
            {{ displayedFarmer.products.map(p => p.name).join(" &bull; ") }}
          </v-card-title>

        </v-img>
        <v-card-title>{{ displayedFarmer.name }}</v-card-title>

        <v-card-text class="description grey--text text--darken-2" v-if="typeof displayedFarmer.description === 'string'">
          {{ displayedFarmer.description }}
        </v-card-text>
        <v-card-text class="my-3">
          <v-form class="px-3" v-model="valid">
            <v-row v-for="(produce, i) in displayedFarmer.products" :key="produce.name"
              class="product-row py-3"
            >
              <v-layout row wrap>
                <v-flex xs12 md7>
                  <v-checkbox
                    v-model="displayedFarmer.products[i].want"
                    @change="wantCheckboxChanged(i)"
                    :label="produceLabel(produce)"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 md12>
                  <v-card>
                    <v-card-title><v-img :src="displayedFarmer.products[i].image"></v-img></v-card-title>
                    <v-card-text>{{ displayedFarmer.products[i].description }}</v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md5>
                  <v-layout row >
                    <v-flex xs2 md2>
                      <v-container class="px-0">
                        <v-btn @click="quantityMinus(i)" fab dark small color="indigo">
                          <v-icon dark>mdi-minus</v-icon>
                        </v-btn>
                      </v-container>
                    </v-flex>
                    <v-flex xs6 md6>
                      <v-container class="mx-1 px-0">
                        <v-btn
                        rounded
                        large
                        :color="displayedFarmer.products[i].quantity ? 'green' : 'cyan lighten-4'"
                        :text-color="displayedFarmer.products[i].quantity ? 'white' : 'dark-grey'"
                        class="ltr font-weight-bold"
                        :class="displayedFarmer.products[i].quantity ? 'white--text': ''">{{displayedFarmer.products[i].quantity || "0"}} x {{displayedFarmer.products[i].price}}&#8362;
                      </v-btn>
                    </v-container>
                    </v-flex>
                    <v-flex xs2 md2>
                      <v-container class="px-0">
                        <v-btn @click="quantityPlus(i)" fab dark small color="indigo">
                          <v-icon dark>mdi-plus</v-icon>
                        </v-btn>
                      </v-container>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-row>
            <v-layout row>
              <v-flex md12>
                <v-chip color="orange" large>{{ $t('your_order_total') }} {{orderTotal}}&#8362;</v-chip>
              </v-flex>
            </v-layout>

            <v-btn
              large
              :loading="completeButtonLoading"
              color="success"
              :disabled="completeButtonDisabled"
              @click="completeButtonClicked"
              >{{completeButtonText}}</v-btn>

            <v-btn v-if="modifyingFlag"
              large text
              color="red"
              :disabled="cancelOrderButtonDisabled"
              @click="verifyCancellationDialogOpened = true"
            >{{ $t('cancel_order') }}</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import store from '@/store';
import { mapState, mapActions } from 'vuex';
import axios from 'axios';
import UserInfoForm from '@/components/UserInfoForm.vue';
import OfferLogin from '@/components/OfferLogin.vue';
import OrderSummary from '@/components/OrderSummary.vue';

export default {
  name: 'FarmerOrderForm',
  components: {
    UserInfoForm,
    OfferLogin,
    OrderSummary
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
    async cancelOrder() {
      this.cancelButtonsLoading = true;
      await store.dispatch("cancelDisplayedOrder");
      this.cancelButtonsLoading = false;
      this.$router.go(-1);
    },
    pushToDisplayedOrder() {
      if(this.displayedOrder && typeof this.displayedOrder._id === "string") {
        return store.dispatch('pushToDisplayedOrder', {
          ...this.orderJSON,
          _id: this.displayedOrder._id
        })
      }
      store.dispatch('pushToDisplayedOrder', this.orderJSON);
    },
    async completeButtonClicked() {
      this.pushToDisplayedOrder();
      this.sendOrder();
    },
    async sendOrder() {
      this.pushToDisplayedOrder();
      this.completeButtonLoading = true;
      if(this.modifyingFlag) {
        await this.modifyOrder();
      } else {
        await this.commitOrder();
      }
      this.completeButtonLoading = false;
    },
    isLoggedIn() {
      return store.state.loggedInUser.loggedIn;
    },
    produceLabel(produce) {
      return `${produce.name} [${produce.packageSize} ${this.$t(produce.packageUnit.toLowerCase())}]`
    },
    loadFromDisplayedOrder() {
      const order = store.state.displayedOrder;
      if(!(this.displayedFarmer.products instanceof Array)) {
        return;
      }

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
    waitForApproval() {
      return new Promise((resolve) => {
        this.orderSummaryDialogOpened = true;
        this.approvedResolve = resolve;
      });
    },
    approve() {
      if(typeof this.approvedResolve === 'function') {
        this.approvedResolve(true);
        this.approvedResolve = null;
      }
    },
    notApproved() {
      if(typeof this.approvedResolve === 'function') {
        this.approvedResolve(false);
        this.approvedResolve = null;
      }
    },
    async commitOrder() {
      this.closeAllDialogs();

      if(this.isLoggedIn()) {
        await store.dispatch("loadUserInfo"); //load from local storage to state
      }
      if(!this.isUserInfoComplete) {
        if(!this.isLoggedIn()) {
          this.offerLoginDialogOpened = true;
          return;
        }
        this.userInfoDialogOpened = true;
        return;
      }

      const payload = this.orderJSON;

      const approved = await this.waitForApproval();
      if(!approved) {
        return;
      }

      this.isDisabled = true;
      store.dispatch('setSendingOrderToServer', true);
      let newOrderResponse = await axios.post('/api/orders/new', payload);
      store.dispatch('setSendingOrderToServer', false);
      //TODO reflect error to user
      store.dispatch("appendUserOrder", newOrderResponse.data);
      this.completedDialogOpened = true;
    },
    async modifyOrder() {
      const payload = this.orderJSON;
      payload.orderID = this.displayedOrder._id;

      const approved = await this.waitForApproval();
      if(!approved) {
        return;
      }

      this.isDisabled = true;
      try {
        store.dispatch('setSendingOrderToServer', true);
        const modifiedOrderResponse = await axios.post('/api/orders/modify', payload);
        store.dispatch("appendUserOrder", modifiedOrderResponse.data);
        this.completedDialogOpened = true;
      } catch (err) {
        if(err.response.status === 423) {
          console.log("farmer is locked for orders");
        } else {
          console.log("unknown error when trying to modify");
        }
      } finally {
        store.dispatch('setSendingOrderToServer', false);
      }
    }
  },
  data: () => ({
    approvedResolve: null,
    completeButtonLoading: false,
    offerLoginDialogOpened: false,
    userInfoDialogOpened: false,
    orderSummaryDialogOpened: false,
    checkbox: false,
    completedDialogOpened: false,
    valid: false,
    verifyCancellationDialogOpened: false,
    cancelButtonsLoading: false
  }),
  computed: {
    ...mapState([
      'loggedInUser', 'userOrders', 'displayedFarmer', 'displayedOrder', 'sendingOrderToServer'
    ]),
    userInfo: {
      ...mapState({ get: state => state.userInfo }),
      ...mapActions({ set: 'setUserInfo' })
    },
    isUserInfoComplete() {
      const { name, email, phone } = this.userInfo;
      if(typeof name !== "string" || typeof email !== "string" || typeof phone !== "string") {
        return false;
      }
      if(name.length === 0 || email.length === 0 || phone.length === 0) {
        return false;
      }
      return true;
    },
    orderJSON() {
      return {
        name: this.userInfo.name,
        email: this.userInfo.email,
        phone: this.userInfo.phone,
        products: this.displayedFarmer.products.filter(p => p.want),
        farmerID: this.displayedFarmer._id
      }
    },
    completeButtonDisabled() {
      return this.displayedFarmer.products instanceof Array &&
             this.displayedFarmer.products.every(p => p.want !== true) ||
             (this.displayedFarmer.orderLock === 'true') ||
             (this.displayedOrder.completed === 'true');
    },
    modifyingFlag() {
      return this.displayedOrder && typeof this.displayedOrder._id === "string";
    },
    completeButtonText() {
      if(this.displayedFarmer.orderLock === 'true') {
        return this.$t('closed_for_orders');
      }
      if(this.displayedOrder.completed === 'true') {
        return this.$t('order_delivered');
      }
      return this.modifyingFlag ? this.$t('modify_order') : this.$t('complete_order');
    },
    loading() {
      let { loadingDisplayedFarmer, loadingDisplayedOrder, loadingUserOrders } = store.state;
      return loadingDisplayedFarmer || loadingDisplayedOrder || loadingUserOrders;
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
    },
    cancelOrderButtonDisabled() {
      return this.displayedFarmer.orderLock === 'true';
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
    displayedOrder: {
      handler() {
        if(typeof store.state.displayedOrder._id !== 'undefined' && typeof this.displayedFarmer._id !== 'undefined') {
          this.loadFromDisplayedOrder();
        } else {
          //TODO clear form
        }
      },
      immediate: true
    },
    displayedFarmer: {
      handler() {
        if(typeof store.state.displayedOrder._id !== 'undefined' && typeof this.displayedFarmer._id !== 'undefined') {
          this.loadFromDisplayedOrder();
        } else {
          //TODO clear form
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>

.description {
  text-align: start;
  font-weight: bold;
  font-size: 0.98em;
}

.product-row {
  border-top: solid 1px grey;
}

.subtitle {
  text-align: start;
}

.rtl {
  direction: rtl;
}

.ltr {
  direction: ltr;
}
</style>
