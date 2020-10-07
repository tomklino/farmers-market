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
          <router-link to="/myorders">
            <v-btn class="ma-2" text>My Orders<v-icon right>mdi-basket-outline</v-icon></v-btn></router-link>
          <v-btn text
            @click="openLoginDialog"
          >{{ loginButtonString }}</v-btn>
        </v-toolbar>
      </div>
      <v-container width="100%">
        <router-view/>
      </v-container>
    </div>
  </v-app>
</template>

<script>
import LoginDialog from '@/components/LoginDialog.vue'
import axios from 'axios';
import store from '@/store'

export default {
  name: "app",
  components: {
    LoginDialog
  },
  mounted() {
    this.refreshLoggedInUser();
  },
  methods: {
    isAdmin() {
      return store.state.loggedInUser.admin;
    },
    openLoginDialog() {
      this.loginDialogOpened = true;
    },
    async logout() {
      await axios.post('/users/logout');
      await store.dispatch('refreshLoggedInUser');
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
      offerLoginOpen: false,
      loginDialogOpened: false
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
