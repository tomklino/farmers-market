<template>
  <div>
    <v-dialog
      v-model="verifyDeletion"
      width="500"
    >
      <v-card>
        <v-card-title>Are you sure you want to delete?</v-card-title>
        <v-card-text>
          <v-btn large color="red darken-2" v-on:click="performDeletion">Delete</v-btn>
          <v-btn large color="grey lighten-1" v-on:click="cancelDeletion">
            Cancel
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
          v-for="farmer in farmers"
          :key="farmer._id"
        >

          <v-list-item-content>
            <v-list-item-title v-text="farmer.name"></v-list-item-title>
            <v-list-item-subtitle v-text="farmer.produce"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon>
              <v-icon
                color="red darken-2"
                v-on:click='requestDeletion(farmer._id)'
              >mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import store from '@/store'
import axios from 'axios';

export default {
  name: 'ManageFarmers',
  data: () => ({
    verifyDeletion: false,
    pendingDeletion: "",
  }),
  computed: {
    farmers() {
      return store.state.farmersList
    }
  },
  mounted () {
    store.dispatch('refreshFarmers');
  },
  methods: {
    async performDeletion() {
      let farmerToDelete = this.pendingDeletion;
      this.pendingDeletion = "";
      this.verifyDeletion = false;
      await axios.delete('/api/farmers/' + farmerToDelete);
      console.log("deleted successfuly:", farmerToDelete);
      this.refreshFarmers();
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
