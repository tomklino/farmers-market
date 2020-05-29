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
        text: "Quantity",
        value: "quantity"
      }
    ]
  }),
  mounted () {
    store.dispatch("fetchOrdersOfFarmer", this.$route.params.farmer_id);
  },
  computed: {
    orders() {
      return store.state.ordersList.filter((o) => {
        return o.farmerID === this.$route.params.farmer_id;
      });
    }
  },
  methods: {
  }
}
</script>
