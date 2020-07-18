<template>
  <v-dialog
    v-model="loginDialogOpened"
    width="500">
    <v-card width="500">
      <v-card-title>{{ loginString }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-if="!isLoggedIn()"
          v-model="devadminPassword"
          type="password"
          label="password"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn large color="green"
          v-if="!isLoggedIn()"
          @click="login"
          >Submit
        </v-btn>
        <v-btn large color="grey"
          v-if="isLoggedIn()"
          @click="logout">
          Logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';
import store from '@/store';

export default {
  name: "LoginDialog",
  props: {
    value: Boolean
  },
  computed: {
    loginString() {
      let loginString = this.isLoggedIn() ?
        store.state.loggedInUser.username :
        "Login"
      console.log("login string is", loginString);
      return loginString
    },
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
    isLoggedIn() {
      return store.state.loggedInUser.loggedIn;
    },
    async logout() {
      await axios.post('/users/logout');
      await store.dispatch('refreshLoggedInUser');
      this.$emit('input', false);
    },
    async login() {
      await axios.post('/users/login/devadmin', {
        password: this.devadminPassword
      })
      await store.dispatch('refreshLoggedInUser');
      this.$emit('input', false);
    }
  }
}
</script>
