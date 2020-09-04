<template>
  <div>
    <v-dialog
      v-model="createdDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>Success!</v-card-title>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="newProduceDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>Add a produce to sell</v-card-title>
        <v-container grid-list-md text-xs-center>
          <v-form v-model="produceValid">

            <v-flex xs12>
              <v-layout row wrap>
                <v-col md="12">
                  <v-text-field
                    v-model="produceName"
                    :rules="produceNameRules"
                    :disabled="isDisabled"
                    label="Name"
                  />
                </v-col>
                <v-col md="3">
                  <v-text-field
                    v-model="packageSize"
                    :disabled="isDisabled"
                    label="Package Size"
                    type="number"
                  />
                </v-col>
                <v-col md="2">
                  <v-select
                    v-model="packageUnit"
                    :items="units"
                    :disabled="isDisabled"
                    label="Unit"
                  ></v-select>
                </v-col>
                <v-col md="4">
                  <v-text-field
                    v-model="price"
                    label="Price"
                    :rules="priceRules"
                    :disabled="isDisabled"
                    hint="₪"
                    persistent-hint
                    type="number"
                  />
                </v-col>
              </v-layout>
            </v-flex>
          </v-form>
        </v-container>
        <v-card-actions>
          <v-btn
            color="green"
            @click="addProduce()"
          >
            Add
          </v-btn>

          <v-btn
            color="grey"
            @click="newProduceDialogOpened = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-form v-model="valid">
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex xs6>
            <v-row>
              <v-text-field
                v-model="name"
                :rules="nameRules"
                :disabled="isDisabled"
                label="Name"
                required
              ></v-text-field>
            </v-row>

            <v-row>
              <v-combobox
                v-model="area"
                :items="areaOptions"
                :rules="areaRules"
                :disabled="isDisabled"
                hide-selected
                deletable-chips
                label="Area"
              >

              </v-combobox>
            </v-row>
            <v-row>
              <v-text-field
                v-model="minimumOrders"
                :disabled="isDisabled"
                label="Minimum Orders"
                type="number"
              />
            </v-row>

            <v-row>
              <v-container class="with-rounded-border">
                <v-row>Products</v-row>
                <v-row>
                  <v-col
                    class="d-flex justify-start"
                  >
                    <v-btn class="mx-2" fab dark small color="indigo"
                      @click="newProduceDialogOpened = true"
                    >
                      <v-icon dark>mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col
                    v-for="(produce, i) in products"
                    :key="produce.text"
                    class="shrink d-flex justify-start"
                  >
                    <v-chip
                      close
                      @click:close="products.splice(i, 1)"
                    >

                      {{ produce.text }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-container>
            </v-row>

            <v-row>
              <v-file-input accept="image/*" label="File input" @change="uploadImage"></v-file-input>
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
                  :disabled="isDisabled"
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
          v-bind:disabled="!complete || isDisabled"
          v-on:click="create"
          >
          Create
        </v-btn>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NewFarmer',
  data: () => ({
    products: [],
    produceValid: false,
    newProduceDialogOpened: false,

    createdDialogOpened: false,
    isDisabled: false,
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
    produceName: "",
    produceNameRules: [
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
      return this.valid &&
        this.selectedPicture &&
        this.arrivalDates.length > 0 &&
        this.products.length > 0
    }
  },
  mounted () {
    console.log("STUB");
  },
  methods: {
    async uploadImage(file) {
      console.log("STUB", file);
      let response = await axios.post('/images/upload', file, {
        headers: {
          'Content-Type': file.type
        }
      });
      console.log("upload done. response:", response);
    },
    addProduce() {
      if(!this.produceValid) {
        return;
      }
      let name = this.produceName;
      let packageSize = this.packageSize;
      let packageUnit = this.packageUnit;
      let price = this.price;

      let produce = { name, packageSize, packageUnit, price };

      produce.text = `${name} - ${packageSize}${packageUnit} - ${price}&#8362;`
      this.products.push(produce);

      //clear and close dialog
      this.produceName = "";
      this.packageSize = 1;
      this.packageUnit = "Kg";
      this.price = 50;
      this.newProduceDialogOpened = false;
    },
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
        products: this.products,
      }
      this.isDisabled = true;
      let creationResponse = await axios.post('/api/farmers/new', payload);
      console.log("created:", creationResponse);
      this.createdDialogOpened = true;
    },
    selectPicture(img) {
      this.selectedPicture = img;
      console.log(this.selectedPicture);
    }
  }
}
</script>

<style scoped>
.with-rounded-border {
  padding: 16px;
  margin: 4px;
  border-style: solid;
  border-width: 2px;
  border-radius: 9px;
  border-color: #1976d2 ;
}
</style>
