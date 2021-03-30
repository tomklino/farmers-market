<template>
  <v-dialog
      v-model="dialogOpened"
      max-width="500px"
    >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="primary"
        dark
        class="mb-2"
        v-bind="attrs"
        v-on="on"
      >
        {{ $t('add_permission') }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title>{{ $t('add_permission') }}</v-card-title>
      <v-card-text>
        <v-container>
          <v-flex xs12>
            <v-layout row wrap>
              <v-col md="12">
                <v-text-field
                  v-model="username"
                  :disabled="isDisabled"
                  :label="$t('username')"
                />
              </v-col>
              <v-col md="12">
                <v-select
                  v-model="resource"
                  :items="resource_types"
                  :disabled="isDisabled"
                  :label="$t('resource')"
                />
              </v-col>
              <v-col md="3">
                <v-checkbox
                  v-model="actions"
                  :label="$t('read_permission')"
                  value="read"
                ></v-checkbox>
                <v-checkbox
                  v-model="actions"
                  :label="$t('modify_permission')"
                  value="modify"
                ></v-checkbox>
                <v-checkbox
                  v-model="actions"
                  :label="$t('delete_permission')"
                  value="delete"
                ></v-checkbox>
              </v-col>
            </v-layout>
          </v-flex>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: "PermissionsDialog",
  data: () => ({
    resource_types: ['farmer', 'order', 'user'],
    isDisabled: false
  }),
  props: {
    value: Boolean
  },
  computed: {
    username: {
      ...mapState({ get: state => state.displayedPermission.username }),
      ...mapActions({ set: 'setDisplayedPermissionUsername' })
    },
    resource: {
      ...mapState({ get: state => state.displayedPermission.resource }),
      ...mapActions({ set: 'setDisplayedPermissionResource' })
    },
    actions: {
      ...mapState({ get: state => state.displayedPermission.actions }),
      ...mapActions({ set: 'setDisplayedPermissionActions' })
    },
    dialogOpened: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
