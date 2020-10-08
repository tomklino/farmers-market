<template>
  <div>
    <FarmerOrderForm />
  </div>
</template>

<script>
import store from '@/store'
import FarmerOrderForm from '@/components/FarmerOrderForm.vue'

export default {
  name: 'FarmerOrderFormView',
  components: {
    FarmerOrderForm
  },
  beforeCreate() {
    store.dispatch("setDisplayedFarmer", this.$route.params.farmer_id);
    store.dispatch("clearDisplayedOrder");
  }
}
</script>
