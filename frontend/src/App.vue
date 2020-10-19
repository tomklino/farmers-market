<template>
  <v-app>
    <div id="app">
      <LoginDialog v-model="loginDialogOpened" />
      <div id="nav">
        <v-toolbar dark color="orange">
          <v-menu
            v-if="$vuetify.breakpoint.smAndDown && menuItems.length > 0"
            offset-y
            bottom
            left
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="item in menuItems"
                :key="item.title"
              >
                <router-link :to="item.to">
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </router-link>
              </v-list-item>
            </v-list>
          </v-menu>
          <router-link class="title" to="/"><v-toolbar-title class="title">{{ $vuetify.breakpoint.smAndUp ? $t('farmers') : "" }}</v-toolbar-title></router-link>
          <v-btn v-if="displayLanguageSwitcherButton" class="ma-2" text @click="switchLanguage()">עב/en</v-btn>
          <v-spacer></v-spacer>
          <v-row class="flex-nowrap justify-end" v-if="$vuetify.breakpoint.mdAndUp">
            <router-link v-for="item in menuItems"
              :key="item.title"
              :to="item.to">
              <v-btn text>{{ item.title }}</v-btn>
            </router-link>
          </v-row>
          <router-link to="/myorders">
            <v-btn class="ma-2" text>{{ $vuetify.breakpoint.mdAndUp ? $t('my_orders') : "" }}<v-icon :right="$vuetify.breakpoint.mdAndUp">mdi-basket-outline</v-icon>
            </v-btn>
          </router-link>
          <v-btn text
            @click="openLoginDialog"
          >{{ loggedInUser.loggedIn ? "" : loginButtonString }}<v-icon v-if="loggedInUser.loggedIn">mdi-account-circle-outline</v-icon></v-btn>
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
import { mapState } from 'vuex'
import store from '@/store'

export default {
  name: "app",
  components: {
    LoginDialog
  },
  created() {
    this.refreshLoggedInUser();
  },
  methods: {
    switchLanguage() {
      this.$i18n.locale = this.$i18n.locale === 'en' ? 'he' : 'en';
      this.$vuetify.rtl = this.$i18n.locale === 'he';
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
      this.$emit('input', false);
    },
    async refreshLoggedInUser() {
      await store.dispatch('refreshLoggedInUser');
    }
  },
  computed: {
    ...mapState(['loggedInUser']),
    displayLanguageSwitcherButton() {
      // HACK feature flag - display only in dev env
      return document.location.host === "farmers.local"
    },
    menuItems() {
      const menuItems = [];
      if(this.$vuetify.breakpoint.xsOnly) {
        menuItems.push({
          title: this.$t("home"),
          to: "/"
        })
      }
      if(this.loggedInUser.admin) {
        menuItems.push({
          title: this.$t("create_new_farmer"),
          to: "/new/farmer"
        });
        menuItems.push({
          title: this.$t("manage_farmers"),
          to: "/manage"
        });
      }
      return menuItems;
    },
    loginButtonString() {
      return !this.loggedInUser.loggedIn ? this.$t('login') :
        this.loggedInUser.username;
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
