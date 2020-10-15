<template>
  <v-data-table
    :headers="headers"
    :items="ordersData"
    :search="search"
    sort-by="name"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-text-field
        v-model="search"
        :label="$t('search')"
        class="mx-4"
        ></v-text-field>
        <v-switch
          v-model="summarize"
          :label="$t('summarize')"
          class="pa-3"
        ></v-switch>
        <v-switch
          v-model="hideFinished"
          :label="$t('hide_finished')"
          class="pa-3"
        ></v-switch>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <OrderSummary v-model="dialog"/>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.name="{ item }">
      <span :style="item.completed === 'true' ? 'text-decoration: line-through;' : '' ">{{ item.name }}</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        class="mr-2"
        @click="openItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        class="mr-2"
        @click="completeOrderActionClicked(item)"
        :color="item.completed === 'true' ? 'green' : 'grey'"
      >
        {{item.completed !== "true" ? "mdi-check-circle-outline" : "mdi-check-circle"}}
      </v-icon>
      <v-icon
        class="mr-2"
        @click="markOrderAsPayedActionClicked(item)"
        :color="item.payed === 'true' ? 'green' : 'grey'"
      >
        {{item.payed !== "true" ? "mdi-cash" : "mdi-cash-check"}}
      </v-icon>
    </template>
    <template v-slot:body.append="{ headers, isMobile, pagination }">
      <tr v-if="isMobile" class="v-data-table__mobile-table-row">
        <td class="v-data-table__mobile-row">
          <div class="v-data-table__mobile-row__header">Total</div>
          <div class="v-data-table__mobile-row__cell">{{pagination.itemsLength}}</div>
        </td>
        <td v-for="header in headers.filter(h => isProductName(h.text))" :key="header.text" class="v-data-table__mobile-row">
          <div class="v-data-table__mobile-row__header">{{header.text}}</div>
          <div class="v-data-table__mobile-row__cell">{{totalOf(header.text)}}</div>
        </td>
      </tr>
      <tr v-if="!isMobile">
        <th v-for="header in headers" :key="header.text">{{header.text === "Name" ? "Total" : totalOf(header.text)}}</th>
      </tr>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary">Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import store from '@/store'
import OrderSummary from '@/components/OrderSummary.vue'
import { mapState } from 'vuex';


function generateSlug(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const encodedArray = Array.from(msgUint8);
  const hex = encodedArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hex;
}

// TODO add buttons to table to remove, or edit:
// https://vuetifyjs.com/en/components/data-tables/#crud-actions
export default {
  name: 'ManageOrders',
  components: {
    OrderSummary
  },
  data: () => ({
    dialog: false,
    search: "",
    summarize: false,
    hideFinished: false
  }),
  computed: {
    ...mapState(['displayedFarmer']),
    headers() {
      let headers = [
        {
          text: this.$t('name'),
          align: "start",
          sortable: true,
          value: "name"
        }
      ]
      if(this.summarize) {
        headers.push({
          text: this.$t('summary'),
          value: "summary",
          filterable: false,
          sortable: false
        });
      } else {
        headers.push(
          {
            text: this.$t('phone'),
            value: "phone",
          },
          {
            text: this.$t('email'),
            value: "email"
          }
        )
        let displayedFarmer = store.state.displayedFarmer;
        if(displayedFarmer.products instanceof Array) {
          displayedFarmer.products.forEach(p => {
            headers.push({
              text: p.name,
              value: `organizedProducts[${generateSlug(p.name)}].quantity`,
              filterable: false
            })
          });
        }
      }
      headers.push(
        {
          text: this.$t('actions'),
          value: 'actions',
          sortable: false,
          filterable: false
        }
      )
      return headers;
    },
    ordersData() {
      const ordersData = [];
      // const totals = [];
      const orders = store.state.ordersList.filter((o) => {
        return o.farmerID === this.$route.params.farmer_id &&
          (!this.hideFinished || o.completed !== "true");
      });
      orders.forEach((order) => {
        ordersData.push({
          _id: order._id,
          name: order.name,
          summary: order.products.map(p => `${p.name} ${p.packageSize}${p.packageUnit} (${p.quantity})`).join(", "),
          phone: order.phone,
          email: order.email,
          completed: order.completed,
          payed: order.payed,
          organizedProducts: order.products.reduce((obj, p) => {
            obj[generateSlug(p.name)] = p;
            return obj;
          }, {})
        })
      });
      return ordersData;
    }
  },
  methods: {
    markOrderAsPayedActionClicked(item) {
      if(item.payed === "true") {
        this.unmarkOrderAsPayed(item._id);
      } else {
        this.markOrderAsPayed(item._id);
      }
    },
    async markOrderAsPayed(orderID) {
      await store.dispatch("markOrderAsPayed", orderID);
    },
    async unmarkOrderAsPayed(orderID) {
      await store.dispatch("unmarkOrderAsPayed", orderID);
    },
    completeOrderActionClicked(item) {
      if(item.completed === "true") {
        this.unCompleteOrder(item._id);
      } else {
        this.completeOrder(item._id);
      }
    },
    isProductName(string) {
      return (this.displayedFarmer.products instanceof Array) &&
          !!this.displayedFarmer.products.find(p => p.name === string);
    },
    totalOf(productName) {
      if( !(this.displayedFarmer.products instanceof Array) ||
          !this.displayedFarmer.products.find(p => p.name === productName)) {
        return "-";
      }
      const productSlug = generateSlug(productName);
      return this.ordersData.filter(o => !this.hideFinished || o.completed !== "true")
        .reduce((sum, o) => {
        return o.organizedProducts[productSlug] ?
          sum + o.organizedProducts[productSlug].quantity :
          sum;
      }, 0);
    },
    openItem(item) {
      store.dispatch('setDisplayedOrder', item._id);
      this.dialog = true;
    },
    async completeOrder(orderID) {
      await store.dispatch("completeOrder", orderID);
    },
    async unCompleteOrder(orderID) {
      await store.dispatch("unCompleteOrder", orderID);
    }
  }
}
</script>
