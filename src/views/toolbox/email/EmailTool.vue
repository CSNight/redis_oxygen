<template>
    <el-card style="margin-top: 20px">
        <el-tabs style="width:100%;height:80vh;" v-model="tab">
            <el-tab-pane label="发送邮件" name="second">
                <el-row :gutter="20" style="height: 73vh">
                    <el-col :span="6" style="height: 100%">
                        <el-form ref="form" :model="form" :rules="rules" size="mini" label-width="100px">
                            <el-form-item label="SMTP地址" prop="host">
                                <el-input v-model="form.host" style="width: 220px;" placeholder="请输入服务器地址"/>
                            </el-form-item>
                            <el-form-item label="SMTP端口" prop="port">
                                <el-input v-model.number="form.port" style="width: 220px;" placeholder="请输入服务器端口号"/>
                            </el-form-item>
                            <el-form-item label="Email账号" prop="email">
                                <el-input v-model="form.email" style="width: 220px;" placeholder="请输入邮箱账户"/>
                            </el-form-item>
                            <el-form-item label="用户名" prop="username">
                                <el-input v-model="form.username" style="width: 220px;" placeholder="请输入用户名（选填）"/>
                            </el-form-item>
                            <el-form-item label="密码/授权码" prop="pwd">
                                <el-input type="password" v-model="form.pwd" style="width: 220px;"
                                          placeholder="请输入授权码或邮箱密码"/>
                            </el-form-item>
                        </el-form>
                        <div class="dialog-footer" style="float: right;margin-right: 80px">
                            <el-button size="mini" icon="el-icon-edit-outline" type="primary" @click="updateConf">保存
                            </el-button>
                        </div>
                    </el-col>
                    <el-col :span="18" style="height: 100%" v-if="rights('MAIL_CONF_ALL')">
                        <el-form label-position="left" label-width="80px" size="mini" style="width: 90%">
                            <el-form-item label="标题" prop="ttl">
                                <el-input v-model="title"/>
                            </el-form-item>
                            <el-form-item label="收件人" prop="ttl">
                                <el-select v-model="emailTo" multiple filterable allow-create clearable
                                           default-first-option style="width: 100%">
                                    <el-option v-for="(item,index) in toList" :key="index" :label="item" :value="item"/>
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <div style="height: 50vh;">
                            <vue-editor style="height: 100%" v-model="content"/>
                        </div>
                        <el-button style="margin-top: 70px" type="primary" size="mini" @click="send"
                                   icon="el-icon-message"> 发送邮件
                        </el-button>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane label="配置管理" name="third">配置管理</el-tab-pane>
        </el-tabs>
    </el-card>

</template>

<script>
    import {VueEditor} from "vue2-editor";
    import {getUserConf, sendMail, setConf} from "@/api/system/mail_api";

    export default {
        name: "EmailTool",
        components: {VueEditor},
        data() {
            return {
                tab: 'second',
                content: '',
                reg: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
                form: {
                    host: "",
                    port: 0,
                    email: '',
                    username: '',
                    pwd: '',
                    encode: 'UTF-8'
                }, rules: {
                    port: [{required: true, message: '请输入正确的端口', trigger: 'blur', min: 1, max: 65535, type: 'number'}],
                    host: [{required: true, message: '请输入正确的服务地址', trigger: 'blur'}],
                    email: [{required: true, trigger: 'blur', validator: this.validateEmail}],
                    pwd: [{required: true, message: '请输入正确的授权码或邮箱密码', trigger: 'blur'}],
                },
                title: '',
                emailTo: [],
                toList: []
            }
        }, created() {
            this.$nextTick(() => {
                this.loadUserConf();
            })
        }, methods: {
            validateEmail(rule, value, callback) {
                if (value === '') {
                    callback(new Error('请正确填写邮箱'));
                } else {
                    if (value !== '') {
                        if (!this.reg.test(value)) {
                            callback(new Error('请输入有效的邮箱'));
                        }
                    }
                    callback();
                }
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadUserConf() {
                getUserConf().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.form = resp.data.message
                    } else {
                        this.$message({
                            type: "warning",
                            message: "未找到邮箱配置"
                        });
                    }
                }).catch(() => {
                    this.$message.error({
                        message: "查询邮箱配置失败"
                    });
                })
            }, updateConf() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        setConf(this.form).then((resp) => {
                            if (resp.data.status === 200 && resp.data.code === 'OK') {
                                this.$message({
                                    type: "success",
                                    message: "邮箱配置成功"
                                });
                            } else {
                                this.$message({
                                    type: "warning",
                                    message: "邮箱配置失败 " + resp.data.message
                                });
                            }
                        }).catch(() => {
                            this.$message.error({
                                message: "邮箱配置失败"
                            });
                        })
                    }
                });
            }, send() {
                if (this.emailTo.length === 0) {
                    this.$message.error({
                        message: "收件人不能为空"
                    });
                }
                let validate = true;
                for (let i = 0; i < this.emailTo.length; i++) {
                    if (!this.reg.test(this.emailTo[i])) {
                        validate = false;
                    }
                }
                if (validate) {
                    let params = {
                        subject: this.title,
                        toList: this.emailTo,
                        content: this.content
                    };
                    sendMail(params).then((resp) => {
                        if (resp.data.status === 200 && resp.data.code === 'OK') {
                            this.$message({
                                type: "success",
                                message: "邮件发送成功"
                            });
                        } else {
                            this.$message({
                                type: "warning",
                                message: "邮件发送失败 " + resp.data.message
                            });
                        }
                    }).catch(() => {
                        this.$message.error({
                            message: "邮件发送失败"
                        });
                    })
                }
            }
        }
    }
</script>

<style scoped>

</style>