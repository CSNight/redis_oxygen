<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增菜单' : '编辑菜单'" width="500px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name" style="width: 370px;"/>
            </el-form-item>
            <el-form-item v-if="form.pid !== 0" label="状态" prop="enabled">
                <el-radio v-for="item in status" :key="item.id" v-model="form.enabled" :label="item.value">{{
                    item.label }}
                </el-radio>
            </el-form-item>
            <el-form-item v-if="form.pid !== 0" style="margin-bottom: 0;" label="上级菜单">
                <tree_select v-model="form.pid" :options="MenuTree" style="width: 370px;" placeholder="选择上级菜单"
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

    export default {
        name: "MenuForm",
        components: {tree_select: tree_select},
        props: {
            isAdd: {
                type: Boolean,
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
                    pid: 1,
                    enabled: true
                },
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
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
            cancel() {
                this.resetForm()
            }, resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    id: '',
                    name: '',
                    pid: 1,
                    enabled: true
                }
            }
        }
    }
</script>

<style scoped>

</style>