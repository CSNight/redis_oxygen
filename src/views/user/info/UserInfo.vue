<template>
    <el-row style="margin-top: 30px">
        <el-col :span="6">
            <div class="card card-user">
                <div class="card-body">
                    <p class="card-text">
                    </p>
                    <div class="author">
                        <div class="block block-one"></div>
                        <div class="block block-two"></div>
                        <div class="block block-three"></div>
                        <div class="block block-four"></div>
                        <el-upload
                                class="upload-demo"
                                action="https://jsonplaceholder.typicode.com/posts/"

                                :before-upload="handleAvatarSuccess"
                                :show-file-list="false"
                                :limit="1">
                            <el-avatar style="width: 124px;height: 124px" :src="head"></el-avatar>
                            <h5 v-text="nick"></h5>
                        </el-upload>
                        <p v-text="name" class="description" style="margin-top: -7px;font-size: 1.14em;"></p>
                    </div>
                    <ul class="user-info">
                        <li>
                            <fa-icon icon-class="fa-phone"/>
                            手机号码
                            <div class="user-right">{{ user.phone }}</div>
                        </li>
                        <li>
                            <fa-icon icon-class="fa-envelope"/>
                            用户邮箱
                            <div class="user-right">{{ user.email }}</div>
                        </li>
                        <li>
                            <fa-icon icon-class="fa-sitemap"/>
                            所属部门
                            <div class="user-right"> {{ user.password}}</div>
                        </li>
                        <li>
                            <fa-icon icon-class="fa-clock-o"/>
                            创建日期
                            <div class="user-right">{{ user.create_time }}</div>
                        </li>
                        <li>
                            <fa-icon icon-class="fa-shield"/>
                            安全设置
                            <div class="user-right">
                                <a>修改密码</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    import {mapGetters} from "vuex";
    import {user_info} from "../../../api/system/login_api";

    export default {
        name: 'UserInfo',
        data() {
            return {
                user: {},
                head: '',
            }
        },
        computed: {
            ...mapGetters([
                'sidebar',
                'avatar',
                'name',
                'nick'
            ])
        },
        created() {
            this.$nextTick(() => {
                setTimeout(() => {
                    // eslint-disable-next-line no-undef
                    this.head = (this.$store.getters.avatar.toString() === '' ? require('../../../assets/logo.png') : this.$store.getters.avatar);
                }, 100);
                this.loadData();
            });
        }, methods: {
            handleAvatarSuccess(file) {
                this.head = file.raw;
            },
            loadData() {
                user_info({name}).then(resp => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.user = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "用户信息查询错误!"
                        });
                    }
                }).catch(() => {
                    this.$message.error({
                        message: "用户信息查询错误!"
                    });
                })
            }
        }
    }
</script>
<style lang="scss" scoped>
    .card {
        color: #999999;
        border: 0;
        position: relative;
        width: 100%;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        border-radius: .2857rem;
        box-shadow: 0 1px 20px 0 rgba(0, 0, 0, .1);
        overflow: hidden;

        .card-body {
            min-height: 240px;
            padding: 15px;
            flex: 1 1 auto;

            .author {
                text-align: center;
                text-transform: none;
                margin-top: 25px;
                overflow: hidden;

                .block {
                    position: absolute;
                    height: 100px;
                    width: 250px;
                }

                .block-two {
                    transform: rotate(30deg);
                    margin-top: -40px;
                    margin-left: -100px;
                    background: rgba(225, 78, 202, .6);
                    background: linear-gradient(90deg, rgba(225, 78, 202, .6) 0, rgba(225, 78, 202, 0));
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
                }

                .block-one {
                    transform: rotate(150deg);
                    margin-top: -90px;
                    margin-left: -50px;
                    background: rgba(225, 78, 202, .6);
                    background: linear-gradient(90deg, rgba(225, 78, 202, .6) 0, rgba(225, 78, 202, 0));
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
                }

                .block-three {
                    background: rgba(225, 78, 202, .6);
                    background: linear-gradient(90deg, rgba(225, 78, 202, .6) 0, rgba(225, 78, 202, 0));
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
                    right: -45px;
                    transform: rotate(170deg);
                    margin-top: -70px;
                }

                .block-four {
                    transform: rotate(150deg);
                    margin-top: -25px;
                    background: rgba(225, 78, 202, .6);
                    background: linear-gradient(90deg, rgba(225, 78, 202, .6) 0, rgba(225, 78, 202, 0));
                    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
                    right: -45px;
                }
            }

            .user-info {
                padding-left: 0px;
                list-style: none;

                li {
                    border-bottom: 1px solid #F0F3F4;
                    border-top: 1px solid #F0F3F4;
                    padding: 11px 0px;
                    font-size: 13px;

                    i {
                        text-align: center;
                    }
                }

                .user-right {
                    float: right;

                    a {
                        color: #317EF3;margin-right: 5px;
                    }
                }
            }
        }
    }
</style>
