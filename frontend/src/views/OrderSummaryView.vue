<template>
  <div>
    <OrderSummary />
  </div>
</template>

<script>
import store from '@/store'

import OrderSummary from '@/components/OrderSummary.vue'

export default {
  name: 'OrderSummaryView',
  components: {
    OrderSummary
  },
  mounted() {
    store.dispatch('setDisplayedOrder', this.$route.params.order_id);
  }
}
</script>
