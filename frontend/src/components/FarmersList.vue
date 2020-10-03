<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex v-for="farmer in farmers" md4 xs12 :key="farmer.id">
        <router-link :to="{ name: 'FarmerOrderForm', params: { farmer_id: farmer._id} }">
          <v-card
            link
            class="mx-auto"
            max-width="400"
          >
            <v-img
              class="white--text align-end"
              height="200px"
              :src="farmer.image"
            >
              <v-card-title>{{ farmer.name }}</v-card-title>
            </v-img>

            <v-card-subtitle class="pb-0">{{ farmer.produce }}</v-card-subtitle>

            <v-card-text class="text--primary">
              <div>Order Minimum: {{ farmer.orderMinimum }}</div>

              <div>Area: {{ farmer.shipmentArea }}</div>
            </v-card-text>
          </v-card>
        </router-link>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import store from '@/store'

export default {
  name: 'FarmersList',
  mounted () {
    store.dispatch('refreshFarmers');
  },
  computed: {
    farmers() {
      return store.state.farmersList;
    }
  }
}
</script>

<style scoped>
* {
    text-decoration: none;
}
</style>
