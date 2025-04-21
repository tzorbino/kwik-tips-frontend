<template>
  <div id="app">
    

    <!-- Router View: Displays the component based on the current route -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Add your styles here */
nav {
  margin-bottom: 20px;
}

router-link {
  margin-right: 10px;
  text-decoration: none;
  color: blue;
}

router-link:hover {
  text-decoration: underline;
}
</style>
