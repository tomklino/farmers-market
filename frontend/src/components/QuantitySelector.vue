<template>
  <v-layout row>
    <v-flex xs2 md2>
      <v-container class="px-0">
        <v-btn @click="$emit('input', Math.max(value - 1, 0))" fab dark small color="indigo">
          <v-icon dark>mdi-minus</v-icon>
        </v-btn>
      </v-container>
    </v-flex>
    <v-flex xs6 md6>
      <v-container class="mx-1 px-0">
        <v-btn
          rounded
          large
          :color="value ? 'green' : 'cyan lighten-4'"
          :text-color="value ? 'white' : 'dark-grey'"
          class="ltr font-weight-bold"
          :class="value ? 'white--text': ''"
          >{{value}}{{text}}
        </v-btn>
    </v-container>
    </v-flex>
    <v-flex xs2 md2>
      <v-container class="px-0">
        <v-btn @click="$emit('input', value + 1)" fab dark small color="indigo">
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "QuantitySelector",
  props: {
    value: Number,
    text: String
  }
}
</script>

<style scoped>
.ltr {
  direction: ltr;
}
</style>
