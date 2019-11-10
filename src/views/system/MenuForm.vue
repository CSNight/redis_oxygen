<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增菜单' : '编辑菜单'" width="580px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="菜单名称" prop="name">
                <el-input v-model="form.name"/>
            </el-form-item>
            <el-form-item label="菜单图标">
                <el-popover
                        width="430"
                        placement="bottom-start"
                        trigger="click"
                        @show="$refs['iconSelect'].reset()">
                    <IconSelect ref="iconSelect" @selected="selected" :icons="icons"/>
                    <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                        <fa-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class-name="fa-1x"
                                 class="el-input__icon"
                                 style="height: 32px;width: 16px;"/>
                        <i v-else slot="prefix" class="el-icon-search el-input__icon"></i>
                    </el-input>
                </el-popover>
            </el-form-item>
            <el-form-item label="">
                <el-switch
                        style="margin-right: 10px"
                        v-model="form.hidden"
                        active-text="隐藏"
                        inactive-text="显示">
                </el-switch>
                <el-divider direction="vertical"></el-divider>
                <el-switch
                        v-model="form.iframe"
                        active-text="外部链接"
                        inactive-text="路由">
                </el-switch>
                <el-divider direction="vertical"></el-divider>
                <template>
                    <label style="margin-left:10px">排序:</label>
                    <el-input-number label="排序" v-model="form.sort" style="margin-left:10px;width: 90px"
                                     controls-position="right"
                                     :min="1" :max="999"></el-input-number>
                </template>
            </el-form-item>
            <el-form-item label="组件名称" prop="component">
                <el-input v-model="form.component"/>
            </el-form-item>
            <el-form-item label="菜单路由" prop="path">
                <el-input v-model="form.path"/>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="上级菜单" prop="pid">
                <tree_select v-model="form.pid" :options="MenuTree" placeholder="选择上级菜单"
                             :normalizer="normalizer"/>
            </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="cancel">取消</el-button>
            <el-button :loading="loading" type="primary">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import tree_select from '@riophae/vue-treeselect'
    import '@riophae/vue-treeselect/dist/vue-treeselect.css'
    import IconSelect from "@/components/IconSelect";

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
                },
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ], pid: [{required: true, message: '请选择上级菜单', trigger: 'blur'}]
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
                }
            }, selected(name) {
                this.form.icon = name
            },
        }
    }
</script>

<style scoped>

</style>