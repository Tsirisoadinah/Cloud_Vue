<template>
  <OfflineMap />
</template>

<script>
import OfflineMap from './components/OfflineMap.vue'

export default {
  name: 'App',
  components: {
    OfflineMap
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
