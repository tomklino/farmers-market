<template>
  <div>
    <NewFarmer />
  </div>
</template>

<script>
import NewFarmer from '@/components/NewFarmer.vue'

export default {
  name: 'NewFarmerView',
  created() {
    this.$store.dispatch('clearDisplayedFarmer');
  },
  components: {
    NewFarmer
  }
}
</script>
