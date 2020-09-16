<template>
  <v-app>
    <div id="app">
      <LoginDialog v-model="loginDialogOpened" />
      <div id="nav">
        <v-toolbar dark color="orange">
          <router-link class="title" to="/"><v-toolbar-title class="title">Farmers</v-toolbar-title></router-link>
          <v-spacer></v-spacer>
          <router-link v-if="isAdmin()" to="/new/farmer">
            <v-btn text>Create Farmer</v-btn></router-link>
          <router-link v-if="isAdmin()" to="/manage">
            <v-btn text>Manage Farmers</v-btn></router-link>
          <GoogleLogin
            :key="googleComponentKey"
            :logoutButton="isSignedInWithGoogle()"
            :params="googleParams"
            :renderParams="googleRenderParams"
            :onSuccess="isSignedInWithGoogle() ? googleLogoutOnSuccess : googleOnSuccess"
            :onFailure="isSignedInWithGoogle() ? googleLogoutOnFailure : googleOnFailure"
          >{{ isSignedInWithGoogle() ? "Logout" : "Login" }}</GoogleLogin>
          <v-btn text
            @click="openLoginDialog"
          >{{ loginButtonString }}</v-btn>
        </v-toolbar>
      </div>
      <router-view/>
    </div>
  </v-app>
</template>

<script>
import LoginDialog from '@/components/LoginDialog.vue'
import GoogleLogin from 'vue-google-login';
import axios from 'axios';
import store from '@/store'

export default {
  name: "app",
  components: {
    LoginDialog,
    GoogleLogin
  },
  mounted() {
    this.refreshLoggedInUser();
  },
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
    isAdmin() {
      return store.state.loggedInUser.admin;
    },
    openLoginDialog() {
      this.loginDialogOpened = true;
    },
    async logout() {
      await axios.post('/users/logout');
      await store.dispatch('refreshLoggedInUser');
      this.forceGoogleRerender(); // HACK due to a bug in google login button - this is used to force a rerender after logout
      this.$emit('input', false);
    },
    async refreshLoggedInUser() {
      await store.dispatch('refreshLoggedInUser');
    }
  },
  computed: {
    loginButtonString() {
      return !store.state.loggedInUser.loggedIn ? "Login" :
        store.state.loggedInUser.username;
    }
  },
  data() {
    return {
      loginDialogOpened: false,
      googleComponentKey: 1, // HACK due to a bug in google login button - this is used to force a rerender after logout
      googleParams: {
        client_id: "573809548678-m51b16050trf1hpd5o6nlv4u5irjbntt.apps.googleusercontent.com"
      },
      googleRenderParams: {
        width: 200,
        height: 50
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.title {
  color: white;
  text-decoration: none;
}

.title:visited {
  color: white;
  text-decoration: none;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
