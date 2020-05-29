<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex v-for="farmer in farmers" xs4 :key="farmer.id">
        <v-card
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

          <v-card-actions>
            <v-btn
              color="orange"
              text
              @click="routeToFarmer(farmer._id)"
            >
              Order
            </v-btn>

            <v-btn
              color="orange"
              text
            >
              Share
            </v-btn>
          </v-card-actions>
        </v-card>
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
      return store.state.farmersList
    }
  },
  methods: {
    routeToFarmer(farmerID) {
      this.$router.push(`/farmer/${farmerID}`);
    }
  }
}
</script>
