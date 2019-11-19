<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增权限' : '编辑权限'" width="570px" @close="resetForm">
        <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="66px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username"/>
            </el-form-item>
            <el-form-item label="状态" prop="enabled">
                <el-switch
                        style="margin-right: 10px"
                        v-model="form.enabled"
                        active-text="启用"
                        inactive-text="禁用">
                </el-switch>
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email"/>
            </el-form-item>
            <el-form-item label="部门">
                <tree_select v-model="form.org_id" :options="dept" style="width: 178px" :normalizer="normalizer"
                             placeholder="选择部门"/>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="角色">
                <el-select v-model="form.roles" style="width: 450px;" multiple placeholder="请选择" value="">
                    <el-option
                            v-for="item in role_select"
                            :disabled="item.level < 2&&role.indexOf('ROLE_DEV')===-1"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"/>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="cancel">取消</el-button>
            <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import tree_select from '@riophae/vue-treeselect'
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'
    import {edit_user, new_user} from "../../../api/system/user_api";

    export default {
        name: "UserForm",
        components: {tree_select},
        props: {
            isAdd: {
                type: Boolean,
                required: true
            },
            roles: {
                type: Array,
                required: true
            },
            dept: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                loading: false, dialog: false, role_select: [], role: this.$store.getters.roles,
                form: {
                    id: '',
                    username: '',
                    nick_name: '',
                    phone: '',
                    email: '',
                    enabled: true,
                    roles: [],
                    org_id: 1,
                },
                rules: {
                    username: [{required: true, message: '请输入用户名', trigger: 'blur'},],
                    email: [{required: true, message: '请输入邮箱地址', trigger: 'blur'}, {
                        type: 'email',
                        message: '请输入正确的邮箱地址',
                        trigger: 'blur'
                    }],
                    phone: [{required: true, message: '请输入正确的手机号', trigger: 'blur'}, {
                        min: 11,
                        max: 11,
                        message: '手机长度不正确',
                        trigger: 'blur'
                    }],
                    enabled: [{required: true, message: '状态不能为空', trigger: 'blur'}]
                }
            }
        }, methods: {
            normalizer(node) {
                if (node.children.length === 0) {
                    delete node.children
                }
                return {
                    id: node.id,
                    label: node.name,
                    children: node.children,
                }
            },
            doSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (this.form.roles.length !== 0 && this.form.org_id !== undefined) {
                            this.loading = true;
                            if (this.isAdd) {
                                this.doAdd();
                            } else this.doEdit();
                        } else {
                            this.$message({
                                message: '角色,部门不能为空',
                                type: 'warning'
                            })
                        }
                    }
                })
            },
            doAdd() {
                let paras = this.format_para(true);
                new_user(paras).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.$message({
                            type: 'success',
                            message: '添加成功!'
                        });
                    } else {
                        this.$message({
                            type: 'warning',
                            message: resp.data.message
                        });
                    }
                    this.loading = false;
                    this.dialog = false;
                    this.$parent.loadData();
                }).catch(() => {
                    this.$message.error({
                        message: "添加失败!"
                    });
                    this.loading = false;
                    this.dialog = false;
                    this.$parent.loadData();
                });
            },
            doEdit() {
                let paras = this.format_para(false);
                edit_user(paras).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.$message({
                            type: 'success',
                            message: '修改成功!'
                        });
                    } else {
                        this.$message({
                            type: 'warning',
                            message: resp.data.message
                        });
                    }
                    this.$parent.loadData();
                    this.loading = false;
                    this.dialog = false;
                }).catch(() => {
                    this.$message.error({
                        message: "修改错误!"
                    });
                    this.loading = false;
                    this.dialog = false;
                    this.$parent.loadData();
                })
            },
            cancel() {
                this.resetForm()
            },
            format_para(isNew) {
                let ros = [];
                for (let i = 0; i < this.form.roles.length; i++) {
                    ros.push({
                        id: this.form.roles[i]
                    })
                }
                let paras = JSON.parse(JSON.stringify(this.form));
                paras.roles = ros;
                if (isNew) {
                    paras.nick_name = paras.username;
                }
                return paras;
            },
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    id: '',
                    username: '',
                    nick_name: '',
                    phone: '',
                    email: '',
                    enabled: true,
                    roles: [],
                    org_id: 1,
                }
            }
        }
    }
</script>

<style scoped>

</style>