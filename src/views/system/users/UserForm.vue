<template>
    <el-dialog :visible.sync="dialog" :close-on-click-modal="false" :before-close="cancel"
               :title="isAdd ? '新增用户' : '编辑用户'" append-to-body width="570px">
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
                <el-input v-model.number="form.phone"/>
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
                            :disabled="item.level < 2"
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
                loading: false, dialog: false, role_select: [],
                form: {
                    id: '',
                    name: '',
                    phone: '',
                    email: '',
                    enabled: true,
                    roles: [],
                    org_id: 1,
                },
                rules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'},
                    ],
                    email: [
                        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
                        {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
                    ],
                    phone: [
                        {required: true, message: '请输入正确的手机号', trigger: 'blur'},
                        {min: 11, max: 11, message: '手机长度不正确', trigger: 'blur'}
                    ],
                    enabled: [
                        {required: true, message: '状态不能为空', trigger: 'blur'}
                    ]
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

            },
            cancel() {
                this.resetForm()
            },
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    id: '',
                    name: '',
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