<template>
    <el-dialog :append-to-body="true" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               width="400px">
        <h1 class="text-white">Welcome!</h1>
        <p class="text-lead text-white">Use this awesome services to monitor your Redis</p>
        <el-form ref="form" :model="form" :rules="rules">
            <el-form-item label="" prop="username">
                <el-input v-model="form.username" name="username" prefix-icon="el-icon-user-solid"
                          placeholder="Username"
                          style="width: 360px;height: 46px"/>
            </el-form-item>
            <el-form-item label="" v-if="!isLogin" prop="email">
                <el-input v-model="form.email" name="email" prefix-icon="fa fa-envelope" placeholder="Email"
                          style="width: 360px;height: 46px"/>
            </el-form-item>
            <el-form-item label="" v-if="!isLogin" prop="phone">
                <el-input v-model="form.phone" name="phone" prefix-icon="el-icon-mobile" placeholder="Phone Number"
                          style="width: 360px;height: 46px"/>
            </el-form-item>
            <el-form-item label="" prop="password">
                <el-input type="password" v-model="form.password" name="password" prefix-icon="fa fa-key"
                          placeholder="Password"
                          style="width: 360px;height: 46px"/>
            </el-form-item>
            <el-form-item v-if="!isLogin" label="" prop="match_password">
                <el-input v-model="form.match_password" name="match_password" prefix-icon="fa fa-key"
                          placeholder="Password Again"
                          style="width: 360px;height: 46px"/>
            </el-form-item>
            <el-form-item label="" prop="ValCode" v-if="isLogin">
                <el-input v-model="form.ValCode" name="ValCode" prefix-icon="fa fa-check" placeholder="VerifyCode"
                          style="width: 270px;height: 46px"/>
                <img class="position-absolute code" style="position: absolute;height: 40px;cursor: pointer"
                     @click="code"
                     :src="src"
                     alt="">
            </el-form-item>
            <p v-if="error_show"
               v-text="error_msg"
               style="color: red">
            </p>
            <el-form-item v-if="isLogin" prop="remember_me">
                <el-checkbox v-model="form.remember_me" name="remember-me">Remember Me</el-checkbox>
            </el-form-item>
            <el-form-item style="text-align: center">
                <el-button v-if="isLogin" :loading="loading" type="primary" @click="login">登录</el-button>
                <el-button v-if="!isLogin" :loading="loading" type="primary">注册</el-button>
            </el-form-item>
        </el-form>

    </el-dialog>
</template>

<script>
    import {login_req} from '../../api/user/login_api';

    export default {
        name: "LoginForm",
        props: {
            isLogin: {
                type: Boolean,
                required: true
            },
            status: {
                type: Array,
                required: true
            }
        }, data() {
            return {
                loading: false, dialog: false, src: "http://localhost:8020/auth/code", error_msg: '',
                form: {
                    username: '',
                    password: '',
                    ValCode: '',
                    email: '',
                    phone: '',
                    match_password: '',
                    remember_me: false,
                    "remember-me": false
                },
                error_show: this.error_msg !== '',
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ]
                }
            }
        }, methods: {
            resetForm() {
                this.$refs['form'].resetFields();
                this.error_msg = '';
                this.code();
                this.form = {
                    username: '',
                    password: '',
                    ValCode: '',
                    email: '',
                    phone: '',
                    match_password: '',
                    remember_me: false,
                    "remember-me": false
                }
            }, cancel() {
                this.dialog = false;
                this.resetForm()
            }, code() {
                this.src = "http://localhost:8020/auth/code?d=" + new Date().getTime();
            }, login() {
                this.form["remember-me"] = this.form.remember_me;
                login_req(this.form).then((resp) => {
                    if (resp.data.status === 200) {
                        this.dialog = false;
// eslint-disable-next-line no-console
                        console.log(resp.data.message);
                    } else {
// eslint-disable-next-line no-console
                        this.resetForm();
                        this.error_msg = resp.data.message;

                    }
                });
            }
        }
    }
</script>

<style scoped>
    .text-white {
        color: #409EFF;
        text-align: center;
    }
</style>