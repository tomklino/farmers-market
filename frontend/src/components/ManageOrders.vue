<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="orders"
      :items-per-page="50"
      class="elevation-1"
    ></v-data-table>
  </div>
</template>

<script>
import store from '@/store'
// TODO add buttons to table to remove, or edit:
// https://vuetifyjs.com/en/components/data-tables/#crud-actions
export default {
  name: 'ManageOrders',
  data: () => ({
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
  }
}
</script>
