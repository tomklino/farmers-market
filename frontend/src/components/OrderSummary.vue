<template>
  <div>
    <v-card v-if="loading">
      <v-skeleton-loader
        class="mx-auto"
        width="100%"
        type="card"
      ></v-skeleton-loader>
    </v-card>
    <v-card
      v-else
      class="mx-auto"
      width="100%"
      >
      <v-alert v-if="displayWarning" type="warning">{{ $t('your_order_was_not_submitted_yet') }}</v-alert>
      <v-card-title>{{ $t('order_summary') }}</v-card-title>
      <v-list two-line>
        <v-list-item>
          <v-list-item-content class="text-start">
            <v-list-item-title>{{ displayedOrder.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ $t('name') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content class="text-start">
            <v-list-item-title>{{ displayedOrder.phone }}</v-list-item-title>
            <v-list-item-subtitle>{{ $t('phone') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list v-if="displayedOrder.products" two-line>
        <v-list-item v-for="produce in displayedOrder.products.filter(p => p.want)" :key="produce.name">
          <v-list-item-content class="text-start">
            <v-list-item-title>
              {{ produce.name }} ({{produce.quantity}}) - {{ produce.price * produce.quantity }}₪
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content class="text-start">
            <v-list-item-title>{{ total }}₪</v-list-item-title>
            <v-list-item-subtitle>{{ $t('total') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <router-link v-if="modifyOrderFlag && !disableGoToOrderButton" style="text-decoration: none; color: inherit;" :to="{ name: 'OrderSummary', params: { order_id: displayedOrder._id} }">
          <v-btn class="ma-2" text color="orange">{{ $t('modify_order') }}<v-icon right>mdi-pencil</v-icon></v-btn>
        </router-link>
        <v-btn
          @click="$emit('input', false)"
          color="grey--lighten-1"
          class="ma-2 grey--text text--darken-3"
        >{{ closeButtonText || $t('close') }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="typeof approveButtonText === 'string'"
          @click="$emit('approved', true)"
          :loading="sendingOrderToServer"
          color="green"
          class="ma-2 grey--text text--lighten-4"
        >{{ approveButtonText || $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex';

export default {
  name: 'OrderSummary',
  props: [
    'closeButtonText', 'approveButtonText', 'disableGoToOrderButton'
  ],
  computed: {
    ...mapState(['loggedInUser', 'displayedOrder', 'sendingOrderToServer', 'userOrders']),
    displayWarning() {
      if(typeof this.displayedOrder._id === "undefined") {
        return true;
      }
      if(this.orderChanged) {
        return true
      }

      return false;
    },
    orderChanged() {
      const orderInMemory = this.userOrders.find(o => o._id === this.displayedOrder._id);
      if(orderInMemory.products.some(productInMemory => {
        let hasMatchingProduct = this.displayedOrder.products.findIndex(p => {
          return p.name === productInMemory.name &&
                 p.want === productInMemory.want &&
                 p.quantity === productInMemory.quantity
          }) !== -1;
        return !hasMatchingProduct;
      })) { return true }
      if(this.displayedOrder.products.some(productInDisplay => {
        let hasMatchingProduct = orderInMemory.products.findIndex(p => {
          return p.name === productInDisplay.name &&
                 p.want === productInDisplay.want &&
                 p.quantity === productInDisplay.quantity
          }) !== -1;
        return !hasMatchingProduct;
      })) { return true }
      return false;
    },
    modifyOrderFlag() {
      return this.displayedOrder && typeof this.displayedOrder._id === "string";
    },
    total() {
      let total = 0;
      for (let p of store.state.displayedOrder.products) {
        total += p.quantity * p.price
      }
      return total;
    },
    loading() {
      return store.state.loadingDisplayedOrder;
    }
  },
  methods: {
    isAdmin() {
      return store.state.loggedInUser.admin;
    },
    async completeOrder(orderID) {
      this.isLoading = true;
      await store.dispatch("completeOrder", orderID);
      this.isLoading = false;
      //TODO reflect error to the user
    },
    async unCompleteOrder(orderID) {
      this.isLoading = true;
      await store.dispatch("unCompleteOrder", orderID);
      this.isLoading = false;
      //TODO: reflect error to the user
    }
  },
  data: () => ({
    isLoading: false,
  })
}
</script>
