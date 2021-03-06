<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               title="修改密码" width="570px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="100px">
            <el-form-item label="原始密码" prop="old_password">
                <el-input type="password" v-model="form.old_password" maxLength="20"/>
            </el-form-item>
            <el-form-item label="新密码" prop="password">
                <el-input type="password" v-model="form.password" maxLength="20" @keyup.native="passStrong"/>
                <el-progress v-if="form.password.length>0" style="width: 80%;" :percentage="percent"
                             :color="customColorMethod" :status="status"/>
            </el-form-item>
            <el-form-item label="再次输入" prop="match_password" maxLength="20">
                <el-input type="password" v-model="form.match_password"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="mini" type="text" @click="cancel">取消</el-button>
            <el-button size="mini" :loading="loading" type="primary" @click="doSubmit">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import {change_pass} from "../../../api/system/user_api";

    export default {
        name: "PassForm",
        data() {
            const confirmPass = (rule, value, callback) => {
                if (value) {
                    if (this.form.password !== value) {
                        callback(new Error('两次输入的密码不一致'))
                    } else {
                        callback()
                    }
                } else {
                    callback(new Error('请再次输入密码'))
                }
            };
            return {
                dialog: false, loading: false, percent: 0, status: 'exception',
                form: {
                    username: '',
                    old_password: '',
                    password: '',
                    match_password: ''
                },
                rules: {
                    old_password: [{required: true, message: '请输入原始密码', trigger: 'blur'}],
                    password: [{required: true, message: '请输入新密码', trigger: 'blur'}, {
                        min: 6,
                        max: 20,
                        message: '长度在 6 到 20 个字符',
                        trigger: 'blur'
                    }],
                    match_password: [{required: true, validator: confirmPass, trigger: 'blur'}, {
                        min: 6,
                        max: 20,
                        message: '长度在 6 到 20 个字符',
                        trigger: 'blur'
                    }],
                }
            }
        },
        methods: {
            passStrong() {
                this.percent = this.form.password.length / 20 * 100;
                if (this.percent < 30) {
                    this.status = 'exception'
                } else if (this.percent >= 30 && this.percent < 70) {
                    this.status = 'warning'
                } else {
                    this.status = 'success'
                }
            },
            customColorMethod(percentage) {
                if (percentage < 30) {
                    return '#ff2222';
                } else if (percentage < 70) {
                    return '#e6a23c';
                } else {
                    return '#67c23a';
                }
            },
            doSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid && this.form.username !== '') {
                        this.doChange();
                    } else {
                        this.$message({
                            message: '用户名不能为空',
                            type: 'warning'
                        })
                    }
                })
            },
            doChange() {
                change_pass(this.form).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.$message({
                            message: '密码修改成功，请重新登录',
                            type: 'warning'
                        });
                        this.$store.dispatch('user/logout').then((data) => {
                            this.$message({
                                type: 'info',
                                message: data.message.username + " logout!"
                            });
                            location.reload();
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: resp.data.message,
                    })
                })
            },
            cancel() {
                this.resetForm()
            }, resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    username: '',
                    old_password: '',
                    password: '',
                    match_password: ''
                }
            }
        }
    }
</script>

<style scoped>
    .el-progress__text {
        float: right;
    }

    .el-progress-bar__outer {
        float: left;
    }
</style>
