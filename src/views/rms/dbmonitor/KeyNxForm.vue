<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="'修改有效期'" width="500px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="mini" label-width="120px">
            <el-form-item label="选择过期时间">
                <el-date-picker v-model="selectDate" type="datetime" @change="dateChange" placeholder="选择过期时间"/>
            </el-form-item>
            <el-form-item label="过期时长(ms)" prop="ttl">
                <el-input v-model.number="form.ttl" style="width: 220px;"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="mini" type="text" @click="cancel">取消</el-button>
            <el-button size="mini" :loading="loading" type="primary" @click="doSubmit">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import {expireKeys} from "../../../api/redismanage/redis_keys";

    export default {
        name: "KeyNxForm",
        data() {
            return {
                dialog: false, loading: false,
                selectDate: '',
                form: {
                    keys: [],
                    ttl: '',
                    ins_id: '',
                    db: '',
                },
                rules: {
                    ttl: [{required: true, message: '请输入正确的过期时间', trigger: 'blur', min: -1, type: 'number'}],
                }
            }
        }, methods: {
            dateChange(e) {
                this.form.ttl = new Date(e).getTime();
            },
            resetForm() {
                this.dialog = false;
                this.selectDate = '';
                this.$refs['form'].resetFields();
                this.form = {
                    keys: [],
                    ttl: '',
                    ins_id: '',
                    db: '',
                }
            }, cancel() {
                this.resetForm()
            }, doSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        let type = this.selectDate === '' || this.selectDate == null ? 'ms' : 'at'
                        this.doEdit(type);
                    }
                });
            }, doEdit(type) {
                expireKeys(this.form, type).then((resp) => {
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
                    this.$parent.triggerScan();
                    this.loading = false;
                    this.dialog = false;
                }).catch(() => {
                    this.$message.error({
                        message: "修改错误!"
                    });
                    this.loading = false;
                    this.dialog = false;
                    this.$parent.triggerScan();
                })
            }
        }
    }
</script>

<style scoped>

</style>
