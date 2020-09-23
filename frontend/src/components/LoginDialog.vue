<template>
  <v-dialog
    v-model="loginDialogOpened"
    width="500">
    <v-card width="100%" class="pa-9">
      <v-card-title>{{ loginString }}</v-card-title>
      <v-card flat class="d-flex justify-center my-4">
        <GoogleLogin
          :key="googleComponentKey"
          :logoutButton="isSignedInWithGoogle()"
          :params="googleParams"
          :renderParams="googleRenderParams"
          :onSuccess="isSignedInWithGoogle() ? googleLogoutOnSuccess : googleOnSuccess"
          :onFailure="isSignedInWithGoogle() ? googleLogoutOnFailure : googleOnFailure"
        >{{ isSignedInWithGoogle() ? "Logout" : "Login" }}</GoogleLogin>
      </v-card>
      <v-card-text v-if="!isLoggedIn() && loginAsAdmin">
        <v-text-field
          v-model="devadminPassword"
          type="password"
          label="password"></v-text-field>
      </v-card-text>
      <v-card-text v-if="!isLoggedIn()">
        <v-btn large color="grey"
          @click="loginAsAdmin = true;"
          >Login As Admin
        </v-btn>
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
import GoogleLogin from 'vue-google-login';

export default {
  name: "LoginDialog",
  props: {
    value: Boolean
  },
  components: {
    GoogleLogin
  },
  computed: {
    withGoogle() {
      console.log("withGoogle:", store.state.loggedInUser.withGoogle);
      return store.state.loggedInUser.withGoogle;
    },
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
    loginAsAdmin: false,
    devadminPassword: '',
    googleComponentKey: 1, // HACK due to a bug in google login button - this is used to force a rerender after logout
    googleParams: {
      client_id: "573809548678-m51b16050trf1hpd5o6nlv4u5irjbntt.apps.googleusercontent.com"
    },
    googleRenderParams: {
      width: 200,
      height: 50
    }
  }),
  methods: {
    forceGoogleRerender() {
      this.googleComponentKey++;
      console.log("force google to re-render", this.googleComponentKey);
    },
    async googleOnSuccess(googleUser) {
      console.log("google success - signing in to farmers", googleUser);
      let id_token = googleUser.getAuthResponse().id_token;
      await axios.post("/users/google-signin", {
        id_token
      });
      await store.dispatch('refreshLoggedInUser');
      this.$emit('input', false);
    },
    async googleLogoutOnSuccess() {
      await this.logout();
    },
    async googleLogoutOnFailure(obj) {
      console.log("google failure to logout", obj);
    },
    googleOnFailure(obj) {
      console.log("failure to login", obj);
    },
    isSignedInWithGoogle() {
      console.log("signed in with google?", store.state.loggedInUser.withGoogle);
      return store.state.loggedInUser.withGoogle
    },
    isLoggedIn() {
      return store.state.loggedInUser.loggedIn;
    },
    async logout() {
      await axios.post('/users/logout');
      await store.dispatch('refreshLoggedInUser');
      this.forceGoogleRerender(); // HACK due to a bug in google login button - this is used to force a rerender after logout
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
