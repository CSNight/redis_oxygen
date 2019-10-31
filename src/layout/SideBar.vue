<template>
    <div :class="{'has-logo':showLogo}">
        <logo v-if="showLogo" :collapse="isCollapse"/>
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu
                    :default-active="activeMenu"
                    :collapse="isCollapse"

                    :collapse-transition="false"
                    mode="vertical"
            >
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import Logo from './Logo'
    // import SidebarItem from './SidebarItem'
    // import variables from '@/styles/variables.scss'

    export default {
        components: {Logo},
        computed: {
            ...mapGetters([
                'sidebar'
            ]),
            routes() {
                return this.$router.options.routes
            },
            activeMenu() {
                const route = this.$route
                const {meta, path} = route
                // if set path, the sidebar will highlight the path you set
                if (meta.activeMenu) {
                    return meta.activeMenu
                }
                return path
            },
            showLogo() {
                return true
            },
            // variables() {
            //     return variables
            // },
            isCollapse() {
                return true
            }
        }
    }
</script>
