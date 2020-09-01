<template>
  <div id="app">
    <brush-box></brush-box>
  </div>
</template>

<script>
import brushBox from './components/BrushBox/index.vue'

export default {
  name: 'App',
  components: {
    brushBox
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
