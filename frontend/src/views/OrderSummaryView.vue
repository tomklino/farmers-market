<template>
  <div>
    <OrderSummary />
  </div>
</template>

<script>
// @ is an alias to /src
import OrderSummary from '@/components/OrderSummary.vue'

export default {
  name: 'OrderSummaryView',
  components: {
    OrderSummary
  }
}
</script>
