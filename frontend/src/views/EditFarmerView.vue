<template>
  <div>
    <NewFarmer />
  </div>
</template>

<script>
import store from '@/store'
import NewFarmer from '@/components/NewFarmer.vue'

export default {
  name: 'EditFarmerView',
  created() {
    store.dispatch('setDisplayedFarmer', this.$route.params.farmer_id);
  },
  components: {
    NewFarmer
  }
}
</script>
