<template>
  <v-app>
    <div id="app">
      <div id="nav">
        <v-toolbar dark color="orange">
          <router-link class="title" to="/"><v-toolbar-title class="title">Farmers</v-toolbar-title></router-link>
        </v-toolbar>
      </div>
      <router-view/>
    </div>
  </v-app>
</template>

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
