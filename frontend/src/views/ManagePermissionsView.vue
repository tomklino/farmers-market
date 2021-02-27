<template>
  <div>
    <ManagePermissions />
  </div>
</template>

<script>
// @ is an alias to /src
import ManagePermissions from '@/components/ManagePermissions.vue'

export default {
  name: 'ManagePermissionsView',
  components: {
    ManagePermissions
  }
}
</script>
