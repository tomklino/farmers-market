<template>
  <v-dialog
    v-model="loginDialogOpened"
    width="500">
    <v-card width="500">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="devadminPassword"
          type="password"
          label="password"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn large color="green"
          @click="login"
          >submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
  name: "LoginDialog",
  props: {
    value: Boolean
  },
  computed: {
    loginDialogOpened: {
      get () {
        return this.value;
      },
      set (value) {
        this.$emit('input', value);
      }
    }
  },
  data: () => ({
    devadminPassword: ''
  }),
  methods: {
    async login() {
      await axios.post('/users/login/devadmin', {
        password: this.devadminPassword
      })
      console.log("done");
    }
  }
}
</script>
