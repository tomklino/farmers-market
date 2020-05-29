<template>
  <div>
    <ManageOrders />
  </div>
</template>

<script>
// @ is an alias to /src
import ManageOrders from '@/components/ManageOrders.vue'

export default {
  name: 'ManageOrdersView',
  components: {
    ManageOrders
  }
}
</script>
