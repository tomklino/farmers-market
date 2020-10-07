<template>
  <div id="user_orders">
    <v-dialog
      max-width="460"
      v-model="orderSummaryDialogOpened"
    >
      <OrderSummary v-model="orderSummaryDialogOpened" />
    </v-dialog>
    <v-card max-width="450" min-width="260" class="mx-auto">
      <h1 v-if="userOrders.length === 0" class="pa-3 grey--text text--lighten-1">You have no orders yet</h1>
      <v-list three-line>
        <v-list-item
          @click="displayOrderSummary(order._id)"
          link
          v-for="order in userOrders"
          :key="order._id"
        >
          <v-list-item-avatar>
            <v-img :src="order.farmerImage"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{order.farmerName}}</v-list-item-title>
            <v-list-item-subtitle v-html="order.products.map(o => `${o.name}`).join(', ')"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>{{orderTotal(order)}}&#8362;</v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon>
            <v-icon large>mdi-basket-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Total</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>{{allOrdersTotal}}&#8362;</v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import store from '@/store';
import { mapState } from 'vuex';
import OrderSummary from '@/components/OrderSummary.vue'

export default {
  name: "UserOrders",
  components: {
    OrderSummary
  },
  data: () => {
    return {
      orders: [],
      orderSummaryDialogOpened: false
    }
  },
  methods: {
    displayOrderSummary(orderID) {
      store.dispatch("setDisplayedOrder", orderID);
      this.orderSummaryDialogOpened = true;
    },
    orderTotal(order) {
      return order.products.reduce((s, p) => {
        return s + (p.price * p.quantity)
      }, 0);
    }
  },
  computed: {
    ...mapState(['loggedInUser', 'userOrders']),
    allOrdersTotal() {
      return this.userOrders.reduce((s, o) => s + this.orderTotal(o), 0);
    }
  },
  watch: {
    loggedInUser: {
      handler: () => { store.dispatch("refreshUserOrders") },
      immediate: true
    }
  }
}
</script>

<style scoped>
#user_orders {
  text-align: start;
}
</style>
