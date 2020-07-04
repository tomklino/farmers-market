import Vue from 'vue'
import VueRouter from 'vue-router'
import FarmersListView from '../views/FarmersListView.vue'
import NewFarmerView from '../views/NewFarmerView'
import ManageFarmersView from '../views/ManageFarmersView'
import FarmerOrderFormView from '../views/FarmerOrderFormView'
import ManageOrdersView from '../views/ManageOrdersView'
import OrderSummaryView from '../views/OrderSummaryView'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: FarmersListView
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
    path: '/order/:order_id',
    name: 'OrderSummary',
    component: OrderSummaryView
  },
  {
    path: '/farmers',
    name: 'FarmersList',
    component: FarmersListView
  },
  {
    path: '/orders/:farmer_id',
    name: 'ManageOrders',
    component: ManageOrdersView
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
