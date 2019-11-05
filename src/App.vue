<template>
    <div id="app" class="app">
        <router-view/>
    </div>
</template>

<script>

    export default {
        name: 'app'
    }
</script>
<style scoped>
    .app {
        /*50 = navbar  */
        min-height: calc(100vh - 50px);
        width: 100%;
        position: relative;
        overflow: hidden;
    }
</style>