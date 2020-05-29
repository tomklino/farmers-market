<template>
  <v-container grid-list-md text-xs-center>
    <v-card
      class="mx-auto"
      max-width="480"
      >
      <v-img
        class="white--text align-end"
        height="200px"
        :src="farmer.image"
      >
        <v-card-title>{{ farmer.name }}</v-card-title>
      </v-img>
      <v-card-title>{{ farmer.produce }}</v-card-title>
      <v-card-text class="text-left">
        <p class="text--primary">
          Selling in units of {{ farmer.packageSize }} {{farmer.packageUnit }}
        </p>
        <p class="text--primary">
          Unit price: {{ farmer.price }}₪
        </p>
      </v-card-text>
      <v-card-text>
        <v-form class="px-3" v-model="valid">
          <v-text-field
            v-model="quantity"
            type="number"
            label="How many"
            ></v-text-field>
          <v-text-field
            v-model="name"
            type="text"
            label="Your full name"
            :rules="nameRules"
            ></v-text-field>
          <v-text-field
            v-model="phone"
            type="text"
            label="Phone number"
            :rules="phoneRules"
            ></v-text-field>
          <v-btn
            large
            color="success"
            v-bind:disabled="!valid"
            @click="commitOrder"
            >Complete Order</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import store from '@/store'
import axios from 'axios';

export default {
  name: 'FarmerOrderForm',
  mounted() {
    console.log(this.$route.params.farmer_id);
    store.dispatch("setDisplayedFarmer", this.$route.params.farmer_id);
    console.log(store.state.displayedFarmer);
  },
  methods: {
    async commitOrder() {
      let payload = {
        name: this.name,
        quantity: this.quantity,
        phone: this.phone,
        produce: this.farmer.produce,
        farmerID: this.farmer._id
      }

      console.log(payload);
      let newOrderResponse = await axios.post('/api/orders/new', payload);
      console.log("order submitted:", newOrderResponse);
    }
  },
  data: () => ({
    name: "",
    nameRules: [
      v => !!v || 'Name is required'
    ],
    phoneRules: [
      v => !!v || 'Phone is required'
      // TODO match phone regex
    ],
    phone: "",
    valid: false,
    quantity: 1,
  }),
  computed: {
    farmer() {
      return store.state.displayedFarmer
    }
  }
}
</script>
