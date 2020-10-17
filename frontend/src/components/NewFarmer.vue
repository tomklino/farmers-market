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
          </v-form>
        </v-container>
        <v-card-actions>
          <v-btn
            class="ma-3"
            color="green"
            @click="addProduce()"
          >
            {{ $t('add') }}
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
              <v-combobox
                v-model="area"
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
                v-model="paymentLink"
                :disabled="isDisabled"
                :label="$t('payment_link')"
              />
            </v-row>
            <v-row class="mx-4">
              <v-text-field
                v-model="minimumOrders"
                :disabled="isDisabled"
                :label="$t('order_minimum')"
                type="number"
              />
            </v-row>

            <v-row>
              <v-container>
                <v-row>
                  <v-col
                    class="d-flex justify-start"
                  >
                    <v-btn class="mx-2" rounded dark color="indigo"
                      @click="newProduceDialogOpened = true"
                    >
                      <v-icon dark>mdi-plus</v-icon>{{ $t('product') }}
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
              <v-file-input accept="image/*" :label="$t('upload_an_image')" @change="uploadImage"></v-file-input>
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
          <v-flex md6 xs12>
            <v-row justify="center">
              <v-card>
                <v-card-title>{{ $t('when_can_you_arrive') }}</v-card-title>
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
          class="ma-4"
          v-bind:disabled="!complete || isDisabled"
          v-on:click="create"
          >
          {{ $t('create_new_farmer__button') }}
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
    paymentLink: "",
    products: [],
    produceValid: false,
    newProduceDialogOpened: false,
    createdDialogOpened: false,
    isDisabled: false,
    imageChoices: [],
    selectedPicture: "",
    minimumOrders: 20,
    produce: "",
    produceName: "",
    area: "",
    areaOptions: [ "חרוזים" ], // TODO should be queried from server
    price: 50,
    packageSize: 1,
    packageUnit: "Kg",
    arrivalDates: [],
    name: '',
    valid: false
  }),
  computed: {
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
        this.selectedPicture &&
        this.arrivalDates.length > 0 &&
        this.products.length > 0
    }
  },
  methods: {
    async uploadImage(file) {
      let response = await axios.post('/images/upload', file, {
        headers: {
          'Content-Type': file.type
        }
      });
      this.imageChoices.push(response.data.imageRelativeLink);
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

      produce.text = `${name} - ${packageSize}${packageUnit} - ${price}₪`
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
        paymentLink: this.paymentLink,
        image: this.selectedPicture,
        orderMinimum: this.minimumOrders,
        arrivalDates: this.arrivalDates,
        price: this.price,
        shipmentArea: this.area,
        products: this.products,
      }

      this.isDisabled = true;
      await axios.post('/api/farmers/new', payload);
      this.createdDialogOpened = true;
    },
    selectPicture(img) {
      this.selectedPicture = img;
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
