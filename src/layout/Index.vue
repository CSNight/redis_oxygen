<template>
    <div class="app-wrapper">

        <sidebar class="sidebar-container"/>
        <div class="main-container">
            <div :class="{'fixed-header':fixedHeader}">
                <navbar></navbar>
            </div>
            <app-main/>
        </div>
    </div>
</template>

<script>
    import AppMain from './AppMain'
    import Sidebar from './SideBar'

    export default {
        name: "Index",
        components: {
            AppMain,
            Sidebar,
        }, computed: {
            fixedHeader() {
                return true
            },
        }
    }
</script>

<style scoped>
    .app-wrapper {
        @include clearfix;
        position: relative;
        height: 100%;
        width: 100%;

        &.mobile.openSidebar {
            position: fixed;
            top: 0;
        }
    }

    .drawer-bg {
        background: #000;
        opacity: 0.3;
        width: 100%;
        top: 0;
        height: 100%;
        position: absolute;
        z-index: 999;
    }

    .fixed-header {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9;
        width: calc(100% - #{$sideBarWidth});
        transition: width 0.28s;
    }

    .hideSidebar .fixed-header {
        width: calc(100% - 54px)
    }
</style>