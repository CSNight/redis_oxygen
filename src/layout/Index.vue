<template>
    <div :class="classObj" class="app-wrapper">
        <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"></div>
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
    import Sidebar from './sider/SideBar'
    import Navbar from "./nav/Navbar";

    export default {
        name: "Index",
        components: {
            AppMain,
            Navbar,
            Sidebar,
        }, computed: {
            sidebar() {
                return this.$store.state.app.sidebar
            },
            device() {
                return this.$store.state.app.device
            },
            fixedHeader() {
                return false
            },
            classObj() {
                return {
                    hideSidebar: !this.sidebar.opened,
                    openSidebar: this.sidebar.opened,
                    withoutAnimation: this.sidebar.withoutAnimation,
                    mobile: this.device === 'mobile'
                }
            }
        },
        methods: {
            handleClickOutside() {
                this.$store.dispatch('app/closeSideBar', {withoutAnimation: false})
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>