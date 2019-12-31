<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增权限' : '编辑权限'" width="500px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="编码" prop="name">
                <el-input v-model="form.name" style="width: 370px;"/>
            </el-form-item>
            <el-form-item label="名称" prop="description">
                <el-input v-model="form.description" style="width: 370px;"/>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="所属菜单">
                <tree_select v-model="form.menu.id" :options="menus" style="width: 370px;" placeholder="选择关联菜单"
                             :normalizer="normalizer"/>
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
    import {edit_permit, new_permit} from "../../../api/system/access_api";

    export default {
        name: "AccessForm",
        components: {tree_select: tree_select},
        props: {
            isAdd: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                loading: false, dialog: false,
                form: {
                    id: '',
                    name: '',
                    description: "",
                    menu: {id: 1}
                }, menus: [],
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ],
                    description: [
                        {required: true, message: '请输入描述信息', trigger: 'blur'}
                    ]
                }
            }
        }, methods: {
            normalizer(node) {
                if (node.children &&node.children.length === 0) {
                    delete node.children
                }
                return {
                    id: node.id,
                    label: node.name,
                    children: node.children,
                }
            },
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    id: '',
                    name: '',
                    description: "",
                    menu: {id: 1}
                }
            }, cancel() {
                this.resetForm()
            }, doSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (this.form.menu.id !== undefined) {
                            this.loading = true;
                            if (this.isAdd) {
                                this.doAdd();
                            } else this.doEdit();
                        } else {
                            this.$message({
                                message: '关联菜单不能为空',
                                type: 'warning'
                            })
                        }
                    }
                })
            }, doAdd() {
                new_permit(this.form).then((resp) => {
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
            }, doEdit() {
                edit_permit(this.form).then((resp) => {
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
            }
        }
    }
</script>

<style scoped>

</style>