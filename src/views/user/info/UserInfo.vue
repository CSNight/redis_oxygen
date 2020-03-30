<template>
    <el-row class="bg">
        <PassForm ref="form"/>
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
                                :disabled="!rights('USER_INFO_EDIT')"
                                :action="up_url"
                                accept="image/png, image/jpeg ,image/gif"
                                :on-success="handleSuccess"
                                :on-error="handleError"
                                :before-upload="handleAvatarBefore"
                                with-credentials
                                :show-file-list="false">
                            <el-avatar ref="avatar" style="width: 124px;height: 124px" :src="avatar"/>
                        </el-upload>
                        <h5 v-text="nick"/>
                        <p v-text="name" class="description" style="margin-top: -7px;font-size: 1.14em;"/>
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
                            <fa-icon icon-class="fa-clock"/>
                            创建日期
                            <div class="user-right">{{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(user.create_time))}}
                            </div>
                        </li>
                        <li>
                            <fa-icon icon-class="fa-shield-cross"/>
                            安全设置
                            <div class="user-right"><a v-if="rights('USER_INFO_EDIT')" @click="changePass">修改密码</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <el-card>
                <img style="width: 100%;height: 100%" :src="src"/>
            </el-card>
        </el-col>
        <el-col :span="18">
            <LogTable/>
        </el-col>
    </el-row>
</template>

<script>
    import {mapGetters} from "vuex";
    import {user_info} from "../../../api/system/login_api";
    import PassForm from "./PassForm";
    import {dateFormat} from "../../../utils/utils";
    import LogTable from "./LogTable";

    export default {
        name: 'UserInfo',
        components: {LogTable, PassForm},
        data() {
            return {

                user: {},
                head: '',
                // eslint-disable-next-line no-undef
                src: require("../../../assets/background.jpg"),
                up_url: this.$store.getters.baseUrl + "/users/change_avatar"
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
                this.loadData();
            });
        }, methods: {
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            },
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            handleAvatarBefore(file) {
                const isImage = ['image/jpeg', "image/gif", "image/png"].indexOf(file.type) !== -1;
                if (!isImage) {
                    this.$message.error('上传文件不是图片!');
                    return false;
                }
                const isLt1M = file.size / 1024 / 1024.0;
                if (isLt1M > 0.5) {
                    this.$message.error('上传头像图片大小不能超过 512KB!');
                    return false;
                }
                return isLt1M <= 1;
            },
            handleSuccess(res) {
                if (res.status === 200 && res.code === 'OK') {
                    this.$message({
                        type: "success",
                        message: "修改成功"
                    });
                    this.$store.dispatch('user/get_head');
                } else {
                    this.$message.error({
                        message: "修改失败"
                    })
                }
            }, handleError() {
                this.$message.error({
                    message: "修改失败"
                })
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
            }, changePass() {
                const _this = this.$refs.form;
                _this.form = {
                    username: this.$store.getters.name,
                    old_password: '',
                    password: '',
                    match_password: ''
                };
                _this.dialog = true;
            }
        }
    }
</script>
<style lang="scss" scoped>
    .bg {
        margin-top: 20px;
    }

    .card {
        color: #999999;
        border: 0;
        position: relative;
        width: 100%;
        margin-bottom: 7px;
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
                padding-left: 0;
                list-style: none;

                li {
                    border-bottom: 1px solid #F0F3F4;
                    border-top: 1px solid #F0F3F4;
                    padding: 11px 0;
                    font-size: 13px;

                    i {
                        text-align: center;
                    }
                }

                .user-right {
                    float: right;

                    a {
                        color: #317EF3;
                        margin-right: 5px;
                    }
                }
            }
        }
    }
</style>
