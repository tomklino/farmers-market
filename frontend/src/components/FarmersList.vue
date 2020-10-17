<template>
  <v-container grid-list-md>
    <v-layout class="mx-auto" row wrap>
      <v-flex v-for="farmer in farmers" md4 sm6 xs12 :key="farmer.id">
        <router-link :to="{ name: 'FarmerOrderForm', params: { farmer_id: farmer._id} }">
          <v-hover v-slot:default="{ hover }">
            <v-card
              link
              class="ma-2"
              :elevation="hover ? 12 : 4"
              max-width="600"
            >
              <v-img
                class="white--text align-end"
                height="200px"
                :src="farmer.image"
              >
              </v-img>
              <v-card-title>{{ farmer.name }}</v-card-title>

              <v-card-subtitle class="pb-0">{{ farmer.produce }}</v-card-subtitle>

              <v-card-text rtl class="text--primary">
                <div>{{ $t('order_minimum') }}: {{ farmer.orderMinimum }}</div>

                <div class="rtl">{{ $t('area') }}: {{ farmer.shipmentArea }}</div>
              </v-card-text>
            </v-card>
          </v-hover>
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

.rtl {
  direction: rtl;
}
</style>
