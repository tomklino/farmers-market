<template>
  <div id="create_farmer">
    <v-dialog
      v-model="createdDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>{{ $t('success') }}</v-card-title>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="newProduceDialogOpened"
      width="500"
    >
      <v-card>
        <v-card-title>{{ $t('add_a_produce_to_sell') }}</v-card-title>
        <v-container grid-list-md text-xs-center>
          <v-form v-model="produceValid">

            <v-flex xs12>
              <v-layout row wrap>
                <v-col md="12">
                  <v-text-field
                    v-model="produceName"
                    :rules="produceNameRules"
                    :disabled="isDisabled"
                    :label="$t('produce_name')"
                  />
                </v-col>
                <v-col md="12">
                  <v-text-field
                    v-model="shortProductDescription"
                    :disabled="isDisabled"
                    :label="$t('short_description')"
                  />
                </v-col>
                <v-col md="3">
                  <v-text-field
                    v-model="packageSize"
                    :disabled="isDisabled"
                    :label="$t('package_size')"
                    type="number"
                  />
                </v-col>
                <v-col md="3">
                  <v-select
                    v-model="packageUnit"
                    :items="units"
                    :disabled="isDisabled"
                    :label="$t('unit_size')"
                  ></v-select>
                </v-col>
                <v-col md="4">
                  <v-text-field
                    v-model="price"
                    :label="$t('price')"
                    :rules="priceRules"
                    :disabled="isDisabled"
                    hint="₪"
                    persistent-hint
                    type="number"
                  />
                </v-col>
              </v-layout>
            </v-flex>
            <v-row class="mx-3">
              <v-layout row wrap>
                <v-flex xs3 v-for="image in imageChoices"
                  v-bind:key="image"
                  >
                  <v-card ripple class="mx-auto"
                    v-on:click="selectProductPicture(image)"
                    :elevation="selectedProductPicture === image ? 18 : 1"
                    :outlined="selectedProductPicture === image ? true : false"
                  >
                    <v-img :src="image"></v-img>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-row>
          </v-form>
        </v-container>
        <v-card-actions>
          <v-btn
            class="ma-3"
            color="green"
            :disabled="productButtonDisabled"
            @click="editingProduct ? editProduct() : addProduce()"
          >
            {{ editingProduct ? $t('okay') : $t('add') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            class="ma-3"
            color="grey lighten-2"
            @click="newProduceDialogOpened = false"
          >
            {{ $t('cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-form v-model="valid">
      <v-container grid-list-md>
        <v-layout row wrap>
          <v-flex md6 xs12>
            <v-row class="mx-4">
              <v-text-field
                v-model="name"
                :rules="nameRules"
                :disabled="isDisabled"
                :label="$t('name')"
                required
              ></v-text-field>
            </v-row>

            <v-row class="mx-4">
              <v-textarea
                v-model="description"
                :disabled="isDisabled"
                :label="$t('short_description')"
              ></v-textarea>
            </v-row>

            <v-row class="mx-4">
              <v-combobox
                v-model="shipmentArea"
                :items="areaOptions"
                :rules="areaRules"
                :disabled="isDisabled"
                hide-selected
                deletable-chips
                :label="$t('area')"
              >

              </v-combobox>
            </v-row>
            <v-row class="mx-4">
              <v-text-field
                v-model="owner"
                :disabled="isDisabled"
                :label="$t('owner')"
                />
            </v-row>
            <v-row class="mx-4">
              <v-text-field
                v-model="paymentLink"
                :disabled="isDisabled"
                :label="$t('payment_link')"
              />
            </v-row>
            <v-row class="mx-4">
              <v-text-field
                v-model="orderMinimum"
                :disabled="isDisabled"
                :label="$t('order_minimum')"
                type="number"
              />
            </v-row>
            <v-row>
              <v-file-input accept="image/*" :label="$t('upload_an_image')" @change="uploadImage"></v-file-input>
              <v-layout row wrap>
                <v-flex xs3 v-for="image in imageChoices"
                  v-bind:key="image"
                  >
                  <v-card ripple class="mx-auto"
                    v-on:click="selectPicture(image)"
                    :elevation="displayedFarmer.image === image ? 18 : 1"
                    :outlined="displayedFarmer.image === image ? true : false"
                  >
                    <v-img :src="image"></v-img>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-row>
          </v-flex>
          <v-flex md6 xs12>
            <v-row justify="center">
              <v-card width="400">
                <v-toolbar dark color="indigo">
                  <v-toolbar-title>{{ $t('products') }}</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn icon @click="newProduceDialogOpened = true"><v-icon>mdi-plus</v-icon></v-btn>
                </v-toolbar>
                <v-list width="100%" two-line>
                  <v-list-item v-for="(produce, index) in displayedFarmer.products"
                    :key="produce.name"
                    link
                    @click="openEditProduceDialog(produce.name)"
                  >
                    <v-list-item-avatar>
                      <v-img :src="produce.image"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title style="text-align: start;">{{ produce.name }}</v-list-item-title>
                      <v-list-item-subtitle style="text-align: start;">{{ produce.text }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon @click="deleteProduct(index)"><v-icon>mdi-delete</v-icon></v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-row>
          </v-flex>
        </v-layout>
        <v-btn
          large
          color="success"
          class="ma-4"
          v-bind:disabled="!complete || isDisabled"
          v-on:click="apply"
          >
          {{ this.editMode ? $t('modify_farmer') : $t('create_new_farmer__button') }}
        </v-btn>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState, mapActions } from 'vuex';

function uniq(item, pos, ary) {
  return !pos || item != ary[pos - 1];
}

export default {
  name: 'NewFarmer',
  data: () => ({
    editingProduct: "",
    shortProductDescription: "",
    selectedProductPicture: "",
    produceValid: false,
    newProduceDialogOpened: false,
    createdDialogOpened: false,
    isDisabled: false,
    uploadedImages: [],
    produceName: "",
    areaOptions: [ "חרוזים" ], // TODO should be queried from server
    price: 50,
    packageSize: 1,
    packageUnit: "Kg",
    valid: false
  }),
  computed: {
    ...mapState([ 'displayedFarmer' ]),
    imageChoices() {
      return [
        this.uploadedImages,
        this.displayedFarmer.image,
        this.displayedFarmer.products.map(p => p.image)
      ].flat().sort().filter(uniq);
    },
    name: {
      ...mapState({ get: state => state.displayedFarmer.name }),
      ...mapActions({ set: 'setDisplayedFarmerName' })
    },
    description: {
      ...mapState({ get: state => state.displayedFarmer.description }),
      ...mapActions({ set: 'setDisplayedFarmerDescription' })
    },
    shipmentArea: {
      ...mapState({ get: state => state.displayedFarmer.shipmentArea }),
      ...mapActions({ set: 'setDisplayedShipmentArea' })
    },
    paymentLink: {
      ...mapState({ get: state => state.displayedFarmer.paymentLink }),
      ...mapActions({ set: 'setDisplayedFarmerPaymentLink' })
    },
    owner: {
      ...mapState({ get: state => state.displayedFarmer.owner }),
      ...mapActions({ set: 'setDisplayedFarmerOwner' })
    },
    orderMinimum: {
      ...mapState({ get: state => state.displayedFarmer.orderMinimum }),
      ...mapActions({ set: 'setDisplayedFarmerOrderMinimum' })
    },
    editMode() {
      return typeof this.displayedFarmer._id === 'string';
    },
    productButtonDisabled() {
      return this.selectedProductPicture === "" || this.produceName === "";
    },
    units() {
      return [
        {
          text: this.$t("kg"),
          value: "Kg"
        },
        {
          text: this.$t("gr"),
          value: "gr"
        },
        {
          text: this.$t("unit"),
          value: "unit"
        }
      ]
    },
    produceNameRules() {
      return [
        v => !!v || this.$t('produce_name_is_required'),
      ]
    },
    priceRules() {
      return [
        v => v > 0 || this.$t('price_is_required'),
      ]
    },
    areaRules() {
      return [
        v => !!v || this.$t('area_is_required'),
      ]
    },
    nameRules() {
      return [
        v => !!v || this.$t('name_is_required'),
      ]
    },
    complete() {
      return this.valid &&
        this.displayedFarmer.image &&
        this.displayedFarmer.products instanceof Array &&
        this.displayedFarmer.products.length > 0
    }
  },
  methods: {
    deleteProduct(index) {
      this.$store.commit("removeDisplayedFarmerProduct", index);
    },
    async uploadImage(file) {
      let response = await axios.post('/images/upload', file, {
        headers: {
          'Content-Type': file.type
        }
      });
      this.uploadedImages.push(response.data.imageRelativeLink);
    },
    clearProduceDialog() {
      this.produceName = "";
      this.packageSize = 1;
      this.packageUnit = "Kg";
      this.price = 50;
      this.selectedProductPicture = "";
      this.shortProductDescription = "";

      this.editingProduct = "";
    },
    addProduce() {
      if(!this.produceValid) {
        return;
      }
      let name = this.produceName;
      let packageSize = this.packageSize;
      let packageUnit = this.packageUnit;
      let price = this.price;
      let image = this.selectedProductPicture;
      let description = this.shortProductDescription;

      let produce = { name, packageSize, packageUnit, price, image, description };

      produce.text = `${name} - ${packageSize}${packageUnit} - ${price}₪`
      if(!this.displayedFarmer.products) {
        this.displayedFarmer.products = [];
      }
      this.displayedFarmer.products.push(produce);

      this.newProduceDialogOpened = false;
    },
    openEditProduceDialog(productName) {
      const product = this.displayedFarmer.products.find(p => p.name === productName);
      if(!product) {
        return;
      }

      this.editingProduct = productName;

      this.produceName = product.name;
      this.packageSize = product.packageSize;
      this.packageUnit = product.packageUnit;
      this.price       = product.price;
      this.selectedProductPicture = product.image;
      this.shortProductDescription = product.description;
      this.newProduceDialogOpened = true;
    },
    editProduct() {
      if(!this.produceValid) {
        return;
      }
      const productIndex = this.displayedFarmer.products.findIndex(p => p.name === this.editingProduct);
      if(productIndex === -1) {
        return;
      }

      let name = this.produceName;
      let packageSize = this.packageSize;
      let packageUnit = this.packageUnit;
      let price = this.price;
      let image = this.selectedProductPicture;
      let description = this.shortProductDescription;

      let produce = { name, packageSize, packageUnit, price, image, description };

      produce.text = `${name} - ${packageSize}${packageUnit} - ${price}₪`
      if(!this.displayedFarmer.products) {
        this.displayedFarmer.products = [];
      }

      this.displayedFarmer.products[productIndex] = produce;

      this.newProduceDialogOpened = false;
    },
    async apply() {
      this.isDisabled = true;
      let success;
      if(this.editMode) {
        success = await this.$store.dispatch("modifyFarmer");
      } else {
        success = await this.$store.dispatch("createFarmer");
      }
      this.isDisabled = !success;
      this.createdDialogOpened = success;
    },
    selectPicture(img) {
      this.$set(this.displayedFarmer, 'image', img);
    },
    selectProductPicture(img) {
      this.selectedProductPicture = img;
    }
  },
  watch: {
    newProduceDialogOpened(value, oldValue) {
      if(oldValue === true && value === false) {
        this.clearProduceDialog();
      }
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
  border-color: #1976d2;
}
</style>
