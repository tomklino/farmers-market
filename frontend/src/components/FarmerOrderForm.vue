<template>
  <div>
    <v-dialog
      persistent
      v-model="completedDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>Success!</v-card-title>
        <v-card-actions>
          <v-btn
            text
            color="orange"
            @click="routeToFarmers"
            >Back To Farmers Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        <v-card-title v-if="typeof farmer.products !== 'undefined'">{{ farmer.products.map(p => p.name).join(" &bull; ") }}</v-card-title>
        <v-card-text>
          <v-form class="px-3" v-model="valid">
            <v-layout row wrap>
              <v-row v-for="(produce, i) in farmer.products" :key="produce.name">
                <v-col md-2>
                  <v-checkbox
                    v-model="farmer.products[i].want"
                    :label="produce.text"
                  ></v-checkbox>
                </v-col>
                <v-col md-10>
                <v-text-field
                  v-model="farmer.products[i].quantity"
                  type="number"
                  label="How many"
                  :disabled="isDisabled"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-layout>
            <v-text-field
              v-model="name"
              type="text"
              label="Your full name"
              :rules="nameRules"
              :disabled="isDisabled"
              ></v-text-field>
            <v-text-field
              v-model="phone"
              type="text"
              label="Phone number"
              :rules="phoneRules"
              :disabled="isDisabled"
              ></v-text-field>
            <v-btn
              large
              color="success"
              v-bind:disabled="!valid || isDisabled"
              @click="commitOrder"
              >Complete Order</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
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
    routeToFarmers() {
      this.$router.push("/farmers");
    },
    async commitOrder() {
      let payload = {
        name: this.name,
        phone: this.phone,
        products: this.farmer.products.filter(p => p.want),
        farmerID: this.farmer._id
      }

      console.log(payload);
      this.isDisabled = true;
      let newOrderResponse = await axios.post('/api/orders/new', payload);
      //TODO reflect error to user
      console.log("order submitted:", newOrderResponse);
      this.completedDialogOpened = true;
    }
  },
  data: () => ({
    checkbox: false,
    completedDialogOpened: false,
    isDisabled: false,
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
