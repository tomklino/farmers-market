<template>
  <v-data-table
    :headers="headers"
    :items="permissions"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('permissions') }}</v-toolbar-title>
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script>
  export default {
    name: 'ManagePermissions',
  }
</script>
