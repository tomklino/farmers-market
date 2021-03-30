<template>
  <v-data-table
    :headers="headers"
    :items="permissions"
    :loading="loadingPermissions"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('permissions') }}</v-toolbar-title>
      <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
      <v-spacer></v-spacer>
      <PermissionsDialog />
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store'
import PermissionsDialog from '@/components/PermissionsDialog.vue'

export default {
  name: 'ManagePermissions',
  components: {
    PermissionsDialog
  },
  created() {
    store.dispatch('loadPermissions');
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
    ...mapState(['permissions', 'loadingPermissions']),
    headers() {
      return [
        {
          text: this.$t('username'),
          align: "start",
          sortable: true,
          value: "role"
        },
        {
          text: this.$t('resource'),
          value: "resource"
        },
        {
          text: this.$t('actions'),
          value: "actions"
        }
      ]
    }
  }
}
</script>
