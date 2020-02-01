<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增菜单' : '编辑菜单'" width="580px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="菜单名称" prop="name">
                <el-input v-model="form.name"/>
            </el-form-item>
            <el-form-item label="菜单图标">
                <el-popover width="430" placement="bottom-start" trigger="click" @show="$refs['iconSelect'].reset()">
                    <IconSelect ref="iconSelect" @selected="selected" :icons="icons"/>
                    <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                        <fa-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class-name="fa-1x"
                                 class="el-input__icon" style="height: 32px;width: 16px;"/>
                        <i v-else slot="prefix" class="el-icon-search el-input__icon"/>
                    </el-input>
                </el-popover>
            </el-form-item>
            <el-form-item label="">
                <el-switch style="margin-right: 10px" v-model="form.hidden" active-text="隐藏" inactive-text="显示"/>
                <el-divider direction="vertical"/>
                <el-switch v-model="form.iframe" active-text="外部链接" inactive-text="路由">
                </el-switch>
                <el-divider direction="vertical"/>
                <template>
                    <label style="margin-left:10px">排序:</label>
                    <el-input-number label="排序" v-model="form.sort" style="margin-left:10px;width: 90px"
                                     controls-position="right"
                                     :min="1" :max="999"/>
                </template>
            </el-form-item>
            <el-form-item label="组件名称" prop="component">
                <el-input v-model="form.component"/>
            </el-form-item>
            <el-form-item label="组件编码" prop="component_name">
                <el-input v-model="form.component_name"/>
            </el-form-item>
            <el-form-item v-if="form.iframe" label="菜单路由" prop="path">
                <el-input v-model="form.path"/>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="上级菜单" prop="pid">
                <tree_select v-model="form.pid" :options="MenuTree" placeholder="选择上级菜单" :normalizer="normalizer"/>
            </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="mini" type="text" @click="cancel">取消</el-button>
            <el-button size="mini" :loading="loading" type="primary" @click="doSubmit">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import tree_select from '@riophae/vue-treeselect'
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'
    import IconSelect from "../../../components/IconSelect";
    import {modify_menu, new_menu} from "../../../api/system/menu_api";

    export default {
        name: "MenuForm",
        components: {tree_select: tree_select, IconSelect: IconSelect},
        props: {
            isAdd: {
                type: Boolean,
                required: true
            },
            icons: {
                type: Array,
                required: true
            },
            status: {
                type: Array,
                required: true
            }
        }, data() {
            return {
                loading: false, dialog: false, MenuTree: [],
                form: {
                    id: '',
                    name: '',
                    pid: 0,
                    hidden: false,
                    iframe: false,
                    icon: '',
                    sort: 0,
                    component: '',
                    component_name: '',
                    path: ''
                },
                rules: {
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}],
                    pid: [{required: true, message: '请选择上级菜单', trigger: 'blur'}],
                    component: [{required: true, message: '请填写组件', trigger: 'blur'}],
                    component_name: [{required: true, message: '请填写组件编码', trigger: 'blur'}]
                }
            }
        }, methods: {
            normalizer(node) {
                if (node.children && node.children.length === 0) {
                    delete node.children;
                }
                return {
                    id: node.id,
                    label: node.name,
                    children: node.children,
                }
            },
            cancel() {
                this.resetForm()
            }, resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    id: '',
                    name: '',
                    pid: 0,
                    hidden: false,
                    iframe: false,
                    icon: '',
                    sort: 0,
                    component: '',
                    component_name: '',
                    path: ''
                }
            }, selected(name) {
                this.form.icon = name
            }, doSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (this.form.pid !== undefined) {
                            this.loading = true;
                            if (this.isAdd) {
                                this.doAdd();
                            } else this.doEdit();
                        } else {
                            this.$message({
                                message: '上级菜单不能为空',
                                type: 'warning'
                            })
                        }
                    }
                })
            }, doAdd() {
                new_menu(this.form).then((resp) => {
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
                modify_menu(this.form).then((resp) => {
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
