import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import FarmersListView from '../views/FarmersListView.vue'
import NewFarmerView from '../views/NewFarmerView'
import ManageFarmersView from '../views/ManageFarmersView'
import FarmerOrderFormView from '../views/FarmerOrderFormView'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/new/farmer',
    name: 'NewFarmer',
    component: NewFarmerView
  },
  {
    path: '/manage',
    name: 'ManageFarmers',
    component: ManageFarmersView
  },
  {
    path: '/farmers',
    name: 'FarmersList',
    component: FarmersListView
  },
  {
    path: '/farmer/:farmer_id',
    name: 'FarmerOrderForm',
    component: FarmerOrderFormView
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
