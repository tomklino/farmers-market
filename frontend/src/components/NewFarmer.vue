<template>
  <v-form v-model="valid">
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs6>
          <v-row>
            <v-text-field
              v-model="name"
              :rules="nameRules"
              label="Name"
              required
            ></v-text-field>
          </v-row>

          <v-row>
            <v-combobox
              v-model="produce"
              :items="commonProduce"
              :rules="produceRules"
              hide-selected
              deletable-chips
              hint="What do you want to offer?"
              label="Produce"
              persistent-hint
            >

            </v-combobox>
          </v-row>
          <v-row>
            <v-combobox
              v-model="area"
              :items="areaOptions"
              :rules="areaRules"
              hide-selected
              deletable-chips
              label="Area"
            >

            </v-combobox>
          </v-row>
          <v-row>
            <v-col md="3">
              <v-text-field
                v-model="packageSize"
                label="Package Size"
                type="number"
              />
            </v-col>
            <v-col md="2">
              <v-select
                v-model="packageUnit"
                :items="units"
                label="Unit"
              ></v-select>
            </v-col>
            <v-col md="4">
              <v-text-field
                v-model="price"
                label="Price"
                :rules="priceRules"
                hint="₪"
                persistent-hint
                type="number"
              />
            </v-col>
            <v-col md="3">
              <v-text-field
                v-model="minimumOrders"
                label="Minimum Orders"
                type="number"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-layout row wrap>
              <v-flex xs3 v-for="image in imageChoices"
                v-bind:key="image"
                >
                <v-card ripple class="mx-auto"
                  v-on:click="selectPicture(image)"
                  :elevation="selectedPicture === image ? 18 : 1"
                  :outlined="selectedPicture === image ? true : false"
                >
                  <v-img :src="image"></v-img>
                </v-card>
              </v-flex>
            </v-layout>
          </v-row>
        </v-flex>
        <v-flex xs6>
          <v-row justify="center">
            <v-card>
              <v-card-title>When can you arrive?</v-card-title>
              <v-date-picker
                v-model="arrivalDates"
                multiple
                >
              </v-date-picker>
            </v-card>
          </v-row>
        </v-flex>
      </v-layout>
      <v-btn
        large
        color="success"
        v-bind:disabled="!complete"
        v-on:click="create"
        >
        Create
      </v-btn>
    </v-container>
  </v-form>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NewFarmer',
  data: () => ({
    commonProduce: [ "Strawberries", "Kiwis", "Mangos", "Pineapples" ],
    imageChoices: [
      "/images/strawberries.jpg",
      "/images/kiwis.jpg",
      "/images/mangos.jpg"
    ],
    selectedPicture: "",
    units: [ "Kg", "gr" ],
    minimumOrders: 20,
    produce: "",
    produceRules: [
      v => !!v || 'Produce is required',
    ],
    area: "",
    areaOptions: [ "Haruzim" ],
    areaRules: [
      v => !!v || 'Area is required',
    ],
    price: 50,
    priceRules: [
      v => v > 0 || 'Price has to be set',
    ],
    packageSize: 1,
    packageUnit: "Kg",
    arrivalDates: [],
    name: '',
    nameRules: [
      v => !!v || 'Name is required',
    ],
    valid: false
  }),
  computed: {
    complete() {
      return this.valid && this.selectedPicture && this.arrivalDates.length > 0
    }
  },
  mounted () {
    console.log("STUB");
  },
  methods: {
    async create() {
      var payload = {
        name: this.name,
        packageSize: this.packageSize,
        packageUnit: this.packageUnit,
        image: this.selectedPicture,
        orderMinimum: this.minimumOrders,
        arrivalDates: this.arrivalDates,
        price: this.price,
        shipmentArea: this.area,
        produce: this.produce,
      }
      let creationResponse = await axios.post('/api/farmers/new', payload);
      console.log("created:", creationResponse);
    },
    selectPicture(img) {
      this.selectedPicture = img;
      console.log(this.selectedPicture);
    }
  }
}
</script>
