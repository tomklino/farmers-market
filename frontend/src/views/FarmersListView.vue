<template>
  <div>
    <FarmersList />
  </div>
</template>

<script>
// @ is an alias to /src
import FarmersList from '@/components/FarmersList.vue'

export default {
  name: 'FarmersListView',
  components: {
    FarmersList
  }
}
</script>
