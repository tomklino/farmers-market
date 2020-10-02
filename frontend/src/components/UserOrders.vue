<template>
  <v-card>
    <v-list three-line>
      <v-list-item
        v-for="order in orders"
        :key="order.title"
      >
        <!-- <v-list-item-avatar>
          <v-img :src="order.avatar"></v-img>
        </v-list-item-avatar> -->

        <v-list-item-content>
          <v-list-item-title v-html="order.summary"></v-list-item-title>
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
    if(typeof this.loggedInUser.username === "string") {
      this.getActiveOrders();
    }
  },
  methods: {
    async getActiveOrders() {
      let { username } = this.loggedInUser;
      let params = { username };
      console.log("using the following params to get orders");
      console.log(params);
      const response = await axios.get(`/api/orders/byuser`, { params });
      const orders = response.data['orders'];
      orders.forEach(o => o.summary = o.products.map(p => p.name).join(" "));
      this.orders = orders;
      console.log("got the following orders", this.orders);
    }
  },
  computed: {
    ...mapState(['loggedInUser'])
  },
  watch: {
    loggedInUser() {
      this.getActiveOrders()
    }
  }
}
</script>
