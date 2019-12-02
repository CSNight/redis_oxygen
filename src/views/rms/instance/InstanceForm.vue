<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增实例' : '连接设置'" width="550px" @close="resetForm">
        <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="70px">
            <el-form-item label="名称" prop="name">
                <el-input v-model="form.name"/>
            </el-form-item>
            <el-form-item label="模式">
                <el-select v-model="form.poolType" placeholder="请选择" style="width:130px">
                    <el-option v-for="item in options.mode" :key="item.key" :label="item.label" :value="item.key"/>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form.poolType==='sin'" label="IP">
                <el-input v-model="form.ip"/>
            </el-form-item>
            <el-form-item v-if="form.poolType==='sin'" label="端口">
                <el-input-number label="排序" v-model="form.port" controls-position="right" :min="1" :max="65535"/>
            </el-form-item>
            <el-form-item label=" ">
                <template>
                    <label>DB:</label>
                    <el-input-number label="排序" v-model="form.db" style="width: 80px" controls-position="right" :min="0"
                                     :max="15"/>
                </template>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="cancel">取消</el-button>
            <el-button :loading="loading" type="primary">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        name: "InstanceForm",
        props: {
            isAdd: {
                type: Boolean,
                required: true
            }
        }, data() {
            return {
                loading: false, dialog: false,
                form: {
                    ip: '',
                    port: 6379,
                    name: '',
                    password: null,
                    poolType: 'sin',
                    state: false,
                    db: 0
                },
                options: {
                    mode: [{key: 'sin', label: "单例模式"}, {key: 'sen', label: "集群模式"}]
                },
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ]
                }
            }
        }, methods: {
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    ip: '',
                    port: 6379,
                    name: '',
                    password: null,
                    poolType: 'sin',
                    state: false,
                    db: 0
                }
            }, cancel() {
                this.resetForm()
            }
        }
    }
</script>

<style scoped>

</style>