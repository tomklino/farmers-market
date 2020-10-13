<template>
  <div>
    <v-dialog
      v-model="verifyDeletion"
      width="500"
    >
      <v-card>
        <v-card-title>{{ $t('are_you_sure_you_want_to_delete') }}</v-card-title>
        <v-card-text>
          <v-btn large color="red darken-2" v-on:click="performDeletion">Delete</v-btn>
          <v-btn large color="grey lighten-1" v-on:click="cancelDeletion">
            {{ $t('cancel') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card
      max-width="600"
      class="mx-auto"
    >
      <v-list two-item>
        <v-list-item
          :class='farmer.isLoading ? "grey lighten-3" : ""'
          v-for="farmer in farmersList"
          :key="farmer._id"
        >

          <v-list-item-content>
            <v-list-item-title v-text="farmer.name"></v-list-item-title>
            <v-list-item-subtitle v-text="farmer.produce"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon>
              <v-icon
                v-on:click='routeToFarmerOrders(farmer._id)'
              >mdi-format-list-bulleted</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon
                color="red"
                v-on:click='requestDeletion(farmer._id)'
              >mdi-delete</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon
                :color="farmer.orderLock === 'true' ? 'orange' : 'grey'"
                v-on:click='lockButtonClicked(farmer._id)'>
                {{ farmer.orderLock === 'true' ? "mdi-lock" : "mdi-lock-open-outline"}}
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex';
import axios from 'axios';

export default {
  name: 'ManageFarmers',
  data: () => ({
    verifyDeletion: false,
    pendingDeletion: "",
  }),
  computed: {
    ...mapState(['farmersList'])
  },
  created() {
    store.dispatch('refreshFarmers');
  },
  methods: {
    async lockButtonClicked(farmerID) {
      console.log("farmer", this.farmersList.find(f => f._id === farmerID));
      if(this.farmersList.find(f => f._id === farmerID).orderLock === "true") {
        await store.dispatch('unlockOrders', farmerID)
      } else {
        await store.dispatch('lockOrders', farmerID);
      }
    },
    async performDeletion() {
      let farmerToDelete = this.pendingDeletion;
      this.pendingDeletion = "";
      this.verifyDeletion = false;
      await axios.delete('/api/farmers/' + farmerToDelete);
      store.dispatch('refreshFarmers');
    },
    routeToFarmerOrders(farmerID) {
      this.$router.push(`/orders/${farmerID}`);
    },
    cancelDeletion() {
      this.verifyDeletion = false;
      this.pendingDeletion = "";
    },
    requestDeletion(farmerID) {
      this.verifyDeletion = true;
      this.pendingDeletion = farmerID;
    }
  }
}
</script>
