<template>
    <el-card style="margin-top: 20px">
        <el-tabs style="width:100%;height:80vh;" v-model="tab">
            <el-tab-pane label="发送邮件" name="second">
                <el-row :gutter="20" style="height: 73vh">
                    <el-col :span="6" style="height: 100%" v-if="rights('MAIL_CONF_QUERY')">
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
                            <el-form-item label="常用联系人(分号分隔)">
                                <el-input v-model="form.contact" type="textarea" style="width: 220px;height: 200px"
                                          resize="none"/>
                            </el-form-item>
                        </el-form>
                        <div class="dialog-footer" style="float: right;margin-right: 80px">
                            <el-button size="mini" icon="el-icon-edit-outline" type="primary" @click="updateConf">保存
                            </el-button>
                        </div>
                    </el-col>
                    <el-col :span="18" style="height: 100%">
                        <el-form :rules="sendRules" ref="sender" label-position="left" label-width="80px" size="mini"
                                 :model="sendForm" style="width: 90%">
                            <el-form-item label="标题" prop="title">
                                <el-input v-model="sendForm.title"/>
                            </el-form-item>
                            <el-form-item label="收件人" prop="emailTo">
                                <el-select v-model="sendForm.emailTo" multiple filterable allow-create clearable
                                           placeholder="请输入" default-first-option style="width: 100%">
                                    <el-option v-for="(item,index) in toList" :key="index" :label="item" :value="item"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="抄送人">
                                <el-select v-model="sendForm.ccTo" multiple filterable allow-create clearable
                                           placeholder="请输入" default-first-option style="width: 100%">
                                    <el-option v-for="(item,index) in ccList" :key="index" :label="item" :value="item"/>
                                </el-select>
                            </el-form-item>
                        </el-form>
                        <div style="height: 45vh;">
                            <vue-editor style="height: 100%" v-model="content"/>
                        </div>
                        <el-button style="margin-top: 70px" type="primary" size="mini" @click="send"
                                   :loading="loading" :disabled="sending" icon="el-icon-message"> 发送邮件
                        </el-button>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane label="配置管理" name="third" v-if="rights('MAIL_CONF_ALL')">
                <el-table></el-table>
            </el-tab-pane>
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
                tab: 'second', loading: false, sending: false,
                content: '',
                reg: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
                form: {
                    host: "", port: 0, email: '', username: '', pwd: '', encode: 'UTF-8', receivers: []
                }, rules: {
                    port: [{required: true, message: '请输入正确的端口', trigger: 'blur', min: 1, max: 65535, type: 'number'}],
                    host: [{required: true, message: '请输入正确的服务地址', trigger: 'blur'}],
                    email: [{required: true, trigger: 'blur', validator: this.validateEmail}],
                    pwd: [{required: true, message: '请输入正确的授权码或邮箱密码', trigger: 'blur'}],
                },
                sendForm: {
                    title: '', emailTo: [], ccTo: [],
                },
                sendRules: {
                    title: [{required: true, message: '主题不能为空', trigger: 'blur'}],
                    emailTo: [{required: true, message: '收件人不能为空', trigger: 'change'}],
                },
                toList: [],
                ccList: [],
            }
        }, created() {
            this.$nextTick(() => {
                this.loadUserConf();
            })
        }, watch: {
            "form.contact": {
                handler: function (n, o) {
                    if (n) {
                        let cont = n.split(";");
                        if (cont.length > 2) {
                            this.form.contact = o;
                        }
                    }
                },
                deep: true
            }
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
                        this.form = resp.data.message;
                        if (this.form.contact && this.form.contact !== '') {
                            this.toList = [];
                            let contacts = this.form.contact.split(";");
                            this.toList.push(...contacts);
                        }
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
                        this.form.receivers = this.form.contact.replace(/\n/, "").split(";");
                        for (let i = 0; i < this.form.receivers.length; i++) {
                            if (!this.reg.test(this.form.receivers[i])) {
                                this.$message.error({message: "存在非法收件人地址"});
                                return;
                            }
                        }
                        setConf(this.form).then((resp) => {
                            if (resp.data.status === 200 && resp.data.code === 'OK') {
                                this.toList = [];
                                let contacts = this.form.contact.split(";");
                                this.toList.push(...contacts);
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
                this.$refs.sender.validate((valid) => {
                    if (valid) {
                        for (let i = 0; i < this.sendForm.emailTo.length; i++) {
                            if (!this.reg.test(this.sendForm.emailTo[i])) {
                                this.$message.error({message: "存在非法收件人地址"});
                                return;
                            }
                        }
                        for (let i = 0; i < this.sendForm.ccTo.length; i++) {
                            if (!this.reg.test(this.sendForm.ccTo[i])) {
                                this.$message.error({message: "存在非法抄送人地址"});
                                return;
                            }
                        }
                        if (this.content === '') {
                            this.$message.error({message: "邮件内容不能为空"});
                            return;
                        }
                        let params = {
                            subject: this.sendForm.title,
                            toList: this.sendForm.emailTo,
                            content: this.content,
                            ccList: this.sendForm.ccTo
                        };
                        this.loading = true;
                        this.sending = true;
                        sendMail(params).then((resp) => {
                            if (resp.data.status === 200 && resp.data.message === 'success') {
                                this.$message({type: "success", message: "邮件发送中,请稍后在发送记录中查看发送状态"});
                            } else {
                                this.$message({type: "error", message: "邮件发送失败 " + resp.data.message});
                            }
                            this.loading = false;
                            this.sending = false;
                        }).catch(() => {
                            this.$message.error({message: "邮件发送失败"});
                            this.loading = false;
                            this.sending = false;
                        })
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    /deep/ .el-textarea {
        /deep/ textarea {
            height: 200px;
        }
    }
</style>