<template>
    <v-card min-width="260">
      <v-list three-line>
        <v-list-item
          v-for="order in userOrders"
          :key="order._id"
        >
          <v-list-item-avatar>
            <v-img :src="order.farmerImage"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="order.farmerName"></v-list-item-title>
            <v-list-item-subtitle v-html="order.products.map(o => `${o.name}`).join(', ')"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
</template>

<script>
import axios from 'axios';
import store from '@/store';
import { mapState } from 'vuex';

export default {
  name: "UserOrders",
  data: () => {
    return {
      orders: []
    }
  },
  mounted() {
    if(this.loggedInUser.username.length > 0) {
      store.dispatch("refreshUserOrders");
    }
  },
  computed: {
    ...mapState(['loggedInUser', 'userOrders'])
  },
  watch: {
    loggedInUser() {
      store.dispatch("refreshUserOrders");
    }
  }
}
</script>
