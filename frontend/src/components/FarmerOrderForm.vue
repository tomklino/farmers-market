<template>
  <v-container grid-list-md text-xs-center>
    <v-card>
      <v-card-title>{{produce}}</v-card-title>
      <v-form v-model="valid">
        <v-layout row wrap>
          <v-row>
            <v-text-field
              v-model="quantity"
              type="number"
              label="How many"
              ></v-text-field>
          </v-row>
        </v-layout>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import store from '@/store'

export default {
  name: 'FarmerOrderForm',
  mounted() {
    console.log(this.$route.params.farmer_id);
    store.dispatch("setDisplayedFarmer", this.$route.params.farmer_id);
    console.log(store.state.displayedFarmer);
  },
  data: () => ({
    valid: false,
    quantity: 1,
  }),
  computed: {
    produce() {
      return store.state.displayedFarmer.produce;
    }
  }
}
</script>
