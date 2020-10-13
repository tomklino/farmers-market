<template>
  <v-card min-height=400 width="100%" class="pa-9">
    <v-card flat class="d-flex justify-center my-4">
      <GoogleLogin
        :key="googleComponentKey"
        :logoutButton="isSignedInWithGoogle()"
        :params="googleParams"
        :renderParams="googleRenderParams"
        :onSuccess="isSignedInWithGoogle() ? googleLogoutOnSuccess : googleOnSuccess"
        :onFailure="isSignedInWithGoogle() ? googleLogoutOnFailure : googleOnFailure"
      >{{ isSignedInWithGoogle() ? $t('logout') : $t('login') }}</GoogleLogin>
    </v-card>
    <v-divider>or</v-divider>
    <v-card flat class="d-flex justify-center my-4">
      <v-btn @click="continueAsGuest()">{{ $t('continue_as_guest') }}</v-btn>
    </v-card>
  </v-card>
</template>

<script>
import axios from 'axios';
import store from '@/store';
import GoogleLogin from 'vue-google-login';

export default {
  name: 'OfferLogin',
  components: {
    GoogleLogin
  },
  methods: {
    forceGoogleRerender() {
      this.googleComponentKey++;
    },
    async googleOnSuccess(googleUser) {
      let id_token = googleUser.getAuthResponse().id_token;
      await axios.post("/users/google-signin", {
        id_token
      });
      await store.dispatch('refreshLoggedInUser');
      this.$emit('logged-in');
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
    continueAsGuest() {
      this.$emit("continue-as-guest");
    }
  },
  data: () => ({
    googleComponentKey: 1, // HACK due to a bug in google login button - this is used to force a rerender after logout
    googleParams: {
      client_id: "573809548678-m51b16050trf1hpd5o6nlv4u5irjbntt.apps.googleusercontent.com"
    },
    googleRenderParams: {
      width: 200,
      height: 50
    }
  })
}
</script>
