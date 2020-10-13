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
      <v-card-actions class="justify-center">
        <router-link :to="{ name: 'OrderSummary', params: { order_id: displayedOrder._id} }">
          <v-btn class="ma-2" text color="orange">{{ $t('modify_order') }}<v-icon right>mdi-pencil</v-icon></v-btn>
        </router-link>
        <v-btn raised color="blue"
          v-if="isAdmin()"
          @click="completeOrder(displayedOrder._id)"
          :disabled="isLoading || displayedOrder.completed === 'true'"
          >{{ displayedOrder.completed === "true" ? $t('executed') : $t('execute_order') }}</v-btn>
        <v-btn raised color="red"
          v-if="isAdmin() && displayedOrder.completed === 'true'"
          :disabled="isLoading"
          @click="unCompleteOrder(displayedOrder._id)"
          >{{ $t('undo_execute') }}</v-btn>
        <v-btn
          @click="$emit('input', false)"
          color="green"
          class="grey--text text--darken-3"
        >{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex';

export default {
  name: 'OrderSummary',
  computed: {
    ...mapState(['loggedInUser', 'displayedOrder']),
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
