<template>
  <v-data-table
    :headers="headers"
    :items="orders"
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
          <OrderSummary />
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.name="{ item }">
      <span :style="item.completed === 'true' ? 'text-decoration: line-through;' : '' ">{{ item.name }}</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        small
        class="mr-2"
        @click="openItem(item)"
      >
        mdi-pencil
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

// TODO add buttons to table to remove, or edit:
// https://vuetifyjs.com/en/components/data-tables/#crud-actions
export default {
  name: 'ManageOrders',
  components: {
    OrderSummary
  },
  data: () => ({
    dialog: false,
    headers: [
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
        text: "Summary",
        value: "summary"
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ]
  }),
  mounted () {
    store.dispatch("fetchOrdersOfFarmer", this.$route.params.farmer_id);
  },
  computed: {
    orders() {
      let fetchedOrders = store.state.ordersList.filter((o) => {
        return o.farmerID === this.$route.params.farmer_id;
      });
      console.log("fetched", fetchedOrders);
      fetchedOrders.forEach((order) => {
        order.summary = order.products.map(p => `${p.name} ${p.packageSize}${p.packageUnit} (${p.quantity})`).join(", ");
      })
      return fetchedOrders;
    }
  },
  methods: {
    openItem(item) {
      store.dispatch('setDisplayedOrder', item._id);
      this.dialog = true;
    }
  }
}
</script>
