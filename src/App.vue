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

    [class^="el-icon-fa"], [class*=" el-icon-fa"] {
        display: inline-block;
        font: normal normal normal 14px/1 FontAwesome !important;
        font-size: inherit;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    @import '../node_modules/font-awesome/css/font-awesome.css';
    $fa-css-prefix: el-icon-fa;
</style>