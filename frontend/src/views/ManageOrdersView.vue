<template>
  <div>
    <ManageOrders />
  </div>
</template>

<script>
// @ is an alias to /src
import ManageOrders from '@/components/ManageOrders.vue'
import store from '@/store'

export default {
  name: 'ManageOrdersView',
  created() {
    const farmerID = this.$route.params.farmer_id;
    store.dispatch("setDisplayedFarmer", farmerID);
    store.dispatch("fetchOrdersOfFarmer", farmerID);
  },
  beforeDestroy() {
    store.dispatch("clearDisplayedFarmer");
  },
  components: {
    ManageOrders
  }
}
</script>
