<template>
  <v-card
    class="mx-auto"
    max-width="480
    ">
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
      <v-list-item>
        <v-list-item-content class="text-left">
          <v-list-item-title>{{ order.produce }}</v-list-item-title>
          <v-list-item-subtitle>Produce</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="text-left">
          <v-list-item-title>{{ order.quantity }}</v-list-item-title>
          <v-list-item-subtitle>Quantity</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import store from '@/store'


export default {
  name: 'OrderSummary',
  mounted() {
    store.dispatch('setDisplayedOrder', this.$route.params.order_id);
  },
  computed: {
    order() {
      return store.state.displayedOrder;
    }
  },
  data: () => ({

  })
}
</script>
