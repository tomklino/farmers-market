<template>
  <div>
    <FarmerOrderForm />
  </div>
</template>

<script>
import store from '@/store'

import FarmerOrderForm from '@/components/FarmerOrderForm.vue'

export default {
  name: 'OrderSummaryView',
  components: {
    FarmerOrderForm
  },
  async beforeCreate() {
    await store.dispatch('setDisplayedOrder', this.$route.params.order_id);
    let farmerID = store.state.displayedOrder.farmerID;
    console.log("setting displayed farmer to", farmerID);
    await store.dispatch('setDisplayedFarmer', farmerID);
  }
}
</script>
