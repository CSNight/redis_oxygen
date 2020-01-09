<template>
    <div :class="classObj" class="app-wrapper">
        <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"></div>
        <sidebar class="sidebar-container"/>
        <div class="main-container">
            <div :class="{'fixed-header':fixedHeader}">
                <navbar/>
                <tags-view v-if="needTagsView"/>
            </div>
            <app-main/>
        </div>
    </div>
</template>

<script>
    import AppMain from './AppMain'
    import Sidebar from './sider/SideBar'
    import Navbar from "./nav/Navbar";
    import TagsView from "./TagsView"
    import {mapState} from "vuex";

    export default {
        name: "Index",
        components: {
            AppMain,
            Navbar,
            Sidebar,
            TagsView
        }, computed: {
            ...mapState({
                needTagsView: state => state.dynamic.showTagsView,
            }),
            sidebar() {
                return this.$store.state.app.sidebar
            },
            device() {
                return this.$store.state.app.device
            },
            fixedHeader() {
                return true
            },
            classObj() {
                return {
                    hideSidebar: !this.sidebar.opened,
                    openSidebar: this.sidebar.opened,
                    withoutAnimation: this.sidebar.withoutAnimation,
                    mobile: this.device === 'mobile',

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