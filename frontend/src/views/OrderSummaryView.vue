<template>
  <div>
    <FarmerOrderForm />
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex';

import FarmerOrderForm from '@/components/FarmerOrderForm.vue'

export default {
  name: 'OrderSummaryView',
  components: {
    FarmerOrderForm
  },
  beforeCreate() {
    console.log("setting displayedOrder", this.$route.params.order_id);
    store.dispatch('setDisplayedOrder', this.$route.params.order_id);
  },
  computed: {
    ...mapState(['displayedOrder'])
  },
  watch: {
    displayedOrder: {
      handler() {
        const farmerID = this.displayedOrder.farmerID;
        if(typeof farmerID === "string") {
          store.dispatch('setDisplayedFarmer', farmerID);
        }
      },
      immediate: true
    }
  }
}
</script>
