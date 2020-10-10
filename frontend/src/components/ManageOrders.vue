<template>
  <v-data-table
    :headers="headers"
    :items="ordersData"
    sort-by="name"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Orders</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
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
        v-if="item.completed !== 'true'"
        class="mr-2"
        @click="completeOrder(item._id)"
      >
        mdi-check-circle-outline
      </v-icon>
      <v-icon
        v-if="item.completed === 'true'"
        class="mr-2"
        @click="unCompleteOrder(item._id)"
      >
        mdi-check-circle
      </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" >Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import store from '@/store'
import OrderSummary from '@/components/OrderSummary.vue'

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
    dialog: false
  }),
  computed: {
    headers() {
      let headers = [
        {
          text: "Name",
          align: "start",
          sortable: true,
          value: "name"
        },
        {
          text: "Phone",
          value: "phone",
        },
        {
          text: "Email",
          value: "email"
        },
        {
          text: "Summary",
          value: "summary"
        }
      ]
      let displayedFarmer = store.state.displayedFarmer;
      if(displayedFarmer.products instanceof Array) {
        displayedFarmer.products.forEach(p => {
          headers.push({
            text: p.name,
            value: `organizedProducts[${generateSlug(p.name)}].quantity`
          })
        });
      }
      headers.push(
        {
          text: 'Actions',
          value: 'actions',
          sortable: false
        }
      )
      return headers;
    },
    ordersData() {
      const ordersData = [];
      // const totals = [];
      const fetchedOrders = store.state.ordersList.filter((o) => {
        return o.farmerID === this.$route.params.farmer_id;
      });
      fetchedOrders.forEach((order) => {
        ordersData.push({
          name: order.name,
          summary: order.products.map(p => `${p.name} ${p.packageSize}${p.packageUnit} (${p.quantity})`).join(", "),
          phone: order.phone,
          email: order.email,
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
