<template>
    <div class="navbar">
        <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar"/>
        <breadcrumb class="breadcrumb-container"/>
        <div class="right-menu">
            <template>
                <el-tooltip content="源码地址" effect="dark" placement="bottom">
                    <a target="_blank" href="https://github.com/CSNight/oxygen_vue/" style="margin-right: 30px">
                        <fa-icon style="padding: 3px;margin-bottom: 30px;color:#777777" icon-class="fa-github "/>
                    </a>
                </el-tooltip>
            </template>
            <template>
                <el-tooltip content="全屏" effect="dark" placement="bottom">
                    <a @click="toggleFullScreen" style="margin-right: 25px">
                        <fa-icon style="padding:3px;margin-bottom: 30px;color:#777777" icon-class="fa-arrows-alt"/>
                    </a>
                </el-tooltip>
            </template>
            <template>
                <el-badge :value="3" is-dot class="item" style="margin-right: 20px">
                    <a>
                        <i style="padding:3px;margin-bottom: 30px;color:#777777" class="tim-icons ni ni-sound-wave"/>
                    </a>
                </el-badge>
            </template>
            <el-dropdown class="avatar-container" trigger="click">
                <div class="avatar-wrapper">
                    <el-tooltip class="item" effect="dark" :content="nick" placement="top-start">
                        <img :src="avatar" class="user-avatar">
                    </el-tooltip>
                    <i class="el-icon-caret-bottom"/>
                </div>
                <el-dropdown-menu slot="dropdown" class="user-dropdown">
                    <router-link to="/">
                        <el-dropdown-item>
                            Home
                        </el-dropdown-item>
                    </router-link>
                    <router-link to="/user">
                        <el-dropdown-item>
                            Profile
                        </el-dropdown-item>
                    </router-link>
                    <a target="_blank" href="https://github.com/CSNight/oxygen_vue">
                        <el-dropdown-item>Docs</el-dropdown-item>
                    </a>
                    <el-dropdown-item divided>
                        <span style="display:block;" @click="logout">Log Out</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import breadcrumb from './BreadCrumb'
    import Hamburger from './Hamburger'

    export default {
        name: 'navbar',
        components: {
            breadcrumb,
            Hamburger
        },
        computed: {
            ...mapGetters([
                'sidebar',
                'avatar',
                'name',
                'nick'
            ])
        },
        data() {
            return {
                head: '',
                full: false
            }
        },
        created() {
        },
        methods: {
            toggleSideBar() {
                this.$store.dispatch('app/toggleSideBar')
            },
            toggleFullScreen() {
                if (this.full) {
                    this.full = false;
                    this.exitFullscreen();
                } else {
                    this.full = true;
                    this.fullScreen();
                }
            },
            fullScreen() {
                let element = document.documentElement;
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
            },

            //退出全屏
            exitFullscreen() {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            },
            async logout() {
                await this.$store.dispatch('user/logout').then((data) => {
                    this.$message({
                        type: 'info',
                        message: data.message.username + " logout!"
                    })
                });
                this.$router.push('/');
            }
        }
    }
</script>

<style lang="scss" scoped>
    .navbar {
        height: 50px;
        overflow: hidden;
        position: relative;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

        .hamburger-container {
            line-height: 46px;
            height: 100%;
            float: left;
            cursor: pointer;
            transition: background .3s;
            -webkit-tap-highlight-color: transparent;

            &:hover {
                background: rgba(0, 0, 0, .025)
            }
        }

        .breadcrumb-container {
            float: left;
        }

        .right-menu {
            float: right;
            height: 100%;
            line-height: 50px;

            &:focus {
                outline: none;
            }

            .tim-icons {
                display: inline-block;
                vertical-align: middle;
                speak: none;
                font-size: 18px;
                text-transform: none;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            .icon-sound-wave::before {
                content: "\ea4b";
            }

            .right-menu-item {
                display: inline-block;
                padding: 0 8px;
                height: 100%;
                font-size: 18px;
                color: #5a5e66;
                vertical-align: text-bottom;

                &.hover-effect {
                    cursor: pointer;
                    transition: background .3s;

                    &:hover {
                        background: rgba(0, 0, 0, .025)
                    }
                }
            }

            .avatar-container {
                margin-right: 30px;

                .avatar-wrapper {
                    margin-top: 5px;
                    position: relative;

                    .user-avatar {
                        cursor: pointer;
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        border: 1px solid #5a5e66;
                    }

                    .el-icon-caret-bottom {
                        cursor: pointer;
                        position: absolute;
                        right: -20px;
                        top: 25px;
                        font-size: 12px;
                    }
                }
            }
        }
    }
</style>
