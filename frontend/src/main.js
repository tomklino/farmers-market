import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

new Vue({
  i18n,
  router,
  store,
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
