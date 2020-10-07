<template>
  <v-card
    class="mx-auto"
    width="100%"
    >
    <v-card-title>Order Summary</v-card-title>
    <v-list two-line>
      <v-list-item>
        <v-list-item-content class="text-left">
          <v-list-item-title>{{ order.name }}</v-list-item-title>
          <v-list-item-subtitle>Name</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="text-left">
          <v-list-item-title>{{ order.phone }}</v-list-item-title>
          <v-list-item-subtitle>Phone</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list v-if="order.products" two-line>
      <v-list-item v-for="produce in order.products.filter(p => p.want)" :key="produce.name">
        <v-list-item-content class="text-left">
          <v-list-item-title>
            {{ produce.name }} ({{produce.quantity}}) - {{ produce.price * produce.quantity }}₪
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="text-left">
          <v-list-item-title>{{ total }}₪</v-list-item-title>
          <v-list-item-subtitle>Total</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-card-actions class="justify-center">
      <router-link :to="{ name: 'OrderSummary', params: { order_id: order._id} }">
        <v-btn class="ma-2" text color="orange">Modify Order<v-icon right>mdi-pencil</v-icon></v-btn>
      </router-link>
      <v-btn raised color="blue"
        v-if="isAdmin()"
        @click="completeOrder(order._id)"
        :disabled="isLoading || order.completed === 'true'"
        >{{ order.completed === "true" ? "Executed" : "Execute Order" }}</v-btn>
      <v-btn raised color="red"
        v-if="isAdmin() && order.completed === 'true'"
        :disabled="isLoading"
        @click="unCompleteOrder(order._id)"
        >Undo Executed</v-btn>
      <v-btn
        @click="$emit('input', false)"
        color="green"
        class="grey--text text--darken-3"
      >Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import store from '@/store'

export default {
  name: 'OrderSummary',
  computed: {
    loggedInUser() {
      return store.state.loggedInUser
    },
    order() {
      return store.state.displayedOrder;
    },
    total() {
      let total = 0;
      for (let p of store.state.displayedOrder.products) {
        total += p.quantity * p.price
      }
      return total;
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
