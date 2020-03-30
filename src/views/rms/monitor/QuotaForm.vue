<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增指标' : '修改指标'" width="400px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="mini" label-width="100px">
            <el-form-item label="标量" style="width: 300px" prop="name">
                <el-input v-model="form.name"/>
            </el-form-item>
            <el-form-item label="名称" style="width: 300px" prop="label">
                <el-input v-model="form.label"/>
            </el-form-item>
            <el-form-item label="支持信号量" style="width: 300px" prop="signal">
                <el-select v-model="form.signal" multiple clearable style="width: 200px">
                    <el-option v-for="(t,i) in signal" :key="i" :value="t.value" :label="t.label"/>
                </el-select>
            </el-form-item>
            <el-form-item label="支持表达式" style="width: 300px" prop="exp">
                <el-select v-model="form.exp" multiple clearable style="width: 200px">
                    <el-option v-for="(t,i) in expression" :key="i" :value="t.value" :label="t.label"/>
                </el-select>
            </el-form-item>
            <el-form-item label="单位" style="width: 300px" prop="unit">
                <el-select v-model="form.unit" clearable style="width: 200px">
                    <el-option v-for="(t,i) in [{label:'百分比',value:'percent'},{label:'数值',value:'val'}]" :key="i"
                               :value="t.value" :label="t.label"/>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="mini" type="text" @click="cancel">取消</el-button>
            <el-button size="mini" :loading="loading" type="primary" @click="doSubmit">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import {addIndicator, updateIndicator} from "@/api/redismanage/redis_indicate";

    export default {
        name: "QuotaForm",
        data() {
            return {
                form: {name: '', label: '', signal: [], exp: [], unit: 'value'},
                dialog: false,
                loading: false,
                isAdd: true,
                signal: [{label: "平均值", value: 'mean'}, {label: "最大值", value: 'max'}, {label: "最小值", value: 'min'}],
                expression: [{label: ">", value: '>'},
                    {label: ">=", value: '>='}, {label: "<", value: '<'}, {label: "<=", value: '<='},
                    {label: "!=", value: '!='}, {label: "=", value: '='}, {label: "区间", value: 'between'}],
                rules: {
                    name: [{required: true, message: '请输入指标变量', trigger: 'blur'}],
                    label: [{required: true, message: '请输入名称', trigger: 'blur'}],
                    unit: [{required: true, message: '请选择单位', trigger: 'change'}],
                    signal: [{required: true, message: '请选择信号量', trigger: 'change'}],
                    exp: [{required: true, message: '请选择表达式', trigger: 'change'}],
                }
            }
        }, methods: {
            cancel() {
                this.resetForm();
            },
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {}
            }, doSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (this.isAdd) {
                            this.doAdd();
                        } else this.doEdit();
                    }
                })
            }, doAdd() {
                let params = {
                    name: this.form.name,
                    label: this.form.label,
                    exp_support: this.form.exp.join(";"),
                    sign_support: this.form.signal.join(";"),
                    unit: this.form.unit
                };
                this.loading = true;
                addIndicator(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            type: 'success',
                            message: '添加成功!'
                        });
                    } else {
                        this.$message({
                            type: 'error',
                            message: resp.data.message
                        });
                    }
                    this.loading = false;
                    this.$parent.loadIndicators();
                    this.dialog = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.dialog = false;
                    if (Object.prototype.hasOwnProperty.call(resp,["data"])) {
                        this.$message.error({
                            message: "添加出错!" + resp.data.message
                        });
                    } else {
                        this.$message.error({
                            message: "添加出错!" + resp.message
                        });
                    }
                })
            }, doEdit() {
                let params = {
                    id: this.form.id,
                    name: this.form.name,
                    label: this.form.label,
                    exp_support: this.form.exp.join(";"),
                    sign_support: this.form.signal.join(";"),
                    unit: this.form.unit
                };
                this.loading = true;
                updateIndicator(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            type: 'success',
                            message: '修改成功!'
                        });
                    } else {
                        this.$message({
                            type: 'error',
                            message: resp.data.message
                        });
                    }
                    this.loading = false;
                    this.$parent.loadIndicators();
                    this.dialog = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.dialog = false;
                    if (Object.prototype.hasOwnProperty.call(resp,["data"])) {
                        this.$message.error({
                            message: "修改出错!" + resp.data.message
                        });
                    } else {
                        this.$message.error({
                            message: "修改出错!" + resp.message
                        });
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>