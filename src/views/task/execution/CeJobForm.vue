<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd?'新增命令任务':'修改命令任务配置'" width="440px" @close="resetForm">
        <el-form ref="form" :model="form" :rules="rules" size="mini" label-width="100px">
            <el-form-item label="关联实例" prop="ins_id">
                <el-select style="width: 270px;" v-model="form.ins_id" size="mini">
                    <el-option v-for="(item,i) in instances" :key="i" :label="item.instance_name" :value="item.id"/>
                </el-select>
            </el-form-item>
            <el-form-item label="执行命令" prop="invokeParam">
                <el-input style="width: 270px" v-model="form.invokeParam" maxlength="100"/>
            </el-form-item>
            <el-form-item label="触发器类型">
                <el-select style="width: 270px;" v-model="form.triggerType" size="mini">
                    <el-option v-for="(item,i) in triggerType" :key="i" :label="item.label" :value="item.value"/>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form.triggerType!==1" label="时间单位">
                <el-select style="width: 80px;" v-model="form.timeUnit" size="mini">
                    <el-option v-for="(item,index) in timeUnit" :key="index" :label="item.label" :value="item.value"/>
                </el-select>
                时间间隔
                <el-input-number :min="0" :max="100" v-model="form.interval"></el-input-number>
            </el-form-item>
            <el-form-item v-if="form.triggerType===1" label="Cron表达式" prop="expression">
                <cron-input style="width: 270px;" v-model="form.expression" @change="change" @reset="reset"/>
            </el-form-item>
            <el-form-item label="触发延迟" prop="name">
                <el-radio v-model="form.immediately" label="1">立刻执行</el-radio>
                <el-radio v-model="form.immediately" label="2">延期执行</el-radio>
            </el-form-item>
            <el-form-item v-if="form.immediately!=='1'" label="开始时间">
                <el-date-picker type="datetime" v-model="form.startAt" :picker-options="pickerOptions"/>
            </el-form-item>
            <el-form-item label="任务描述">
                <el-input style="width: 270px" v-model="form.description" type="textarea" show-word-limit
                          maxlength="50"/>
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button size="mini" type="text" @click="cancel">取消</el-button>
            <el-button size="mini" :loading="loading" type="primary" @click="onsubmit">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import CronInput from 'vue-cron-generator/src/components/cron-input'
    import {getAll, getByUser} from "../../../api/redismanage/redis_ins";
    import {addCeJob, modifyCeJobConf} from "../../../api/task/ce_task";

    export default {
        name: "CeJobForm",
        components: {CronInput},
        data() {
            return {
                instances: [], identify: this.$store.getters.identify, isAdd: false,
                dialog: false, loading: false,
                form: {
                    uid: this.identify,
                    jobName: '',
                    ins_id: '',
                    triggerType: 1,
                    expression: '0/3 * * * * ?',
                    immediately: '1',
                    startAt: new Date(),
                    jobGroup: 'EXECUTION',
                    invokeParam: '',
                    timeUnit: 'SECOND',
                    interval: 1,
                    description: ''
                },
                rules: {
                    expression: [{required: true, message: 'cron表达式不能为空', trigger: 'blur'}],
                    ins_id: [{required: true, message: '关联实例不能为空', trigger: 'blur'}],
                    invokeParam: [{required: true, message: '命令不能为空', trigger: 'blur'}],
                },
                timeUnit: [
                    {label: "毫秒", value: "MILLISECOND"},
                    {label: "秒", value: "SECOND"},
                    {label: "分", value: "MINUTE"},
                    {label: "时", value: "HOUR"},
                    {label: "天", value: "DAY"},
                    {label: "周", value: "WEEK"},
                    {label: "月", value: "MONTH"},
                    {label: "年", value: "YEAR"}],
                triggerType: [{label: "Simple", value: 0, type: "success"}, {label: "Cron", value: 1, type: "primary"},
                    {label: "Calendar", value: 2, type: "warning"}, {label: "DailyTime", value: 3, type: "danger"}],
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() < Date.now() + 60 * 1000 * 5;
                    }
                },
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData('false');
            })
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadData(update) {
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll(update);
                } else {
                    this.instances = [];
                    this.loadByUser();
                }
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let ins = resp.data.message;
                        for (let i = 0; i < ins.length; i++) {
                            if (ins[i].role === 'sentinel') {
                                continue;
                            }
                            this.instances.push(ins[i]);
                        }
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadAll(update) {
                getAll(update).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let ins = resp.data.message;
                        for (let i = 0; i < ins.length; i++) {
                            if (ins[i].role === 'sentinel') {
                                continue;
                            }
                            this.instances.push(ins[i]);
                        }
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            },
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    uid: this.identify,
                    jobName: '',
                    ins_id: '',
                    triggerType: 1,
                    immediately: '1',
                    invokeParam: '',
                    expression: '0/3 * * * * ?',
                    startAt: null,
                    jobGroup: 'EXECUTION',
                    timeUnit: 'SECOND',
                    interval: 1,
                    description: ''
                }
            }, cancel() {
                this.resetForm()
            }, onsubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (this.isAdd) {
                            this.addJob();
                        } else {
                            this.modifyJob();
                        }
                    }
                })
            }, addJob() {
                let param = {
                    ins_id: this.form.ins_id,
                    uid: this.identify,
                    jobName: 'execution',
                    invokeParam: this.form.invokeParam,
                    jobGroup: this.form.jobGroup,
                    description: this.form.description,
                    triggerType: this.form.triggerType,
                    triggerConfig: null
                };
                let triggerConf = {
                    triggerGroup: this.form.jobGroup,
                    expression: this.form.expression,
                };
                if (this.form.immediately === '2') {
                    triggerConf['startAt'] = this.form.startAt.getTime();
                }
                param.triggerConfig = JSON.stringify(triggerConf);
                addCeJob(param).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            message: "新增任务成功!",
                            type: 'success'
                        });
                    } else {
                        this.$message.error({
                            message: "新增任务失败! " + resp.data.message
                        });
                    }
                    this.dialog = false;
                    this.$parent.loadCeJobs();
                }).catch((resp) => {
                    this.dialog = false;
                    this.$message.error({
                        message: "新增任务失败! " + resp.data.message
                    });
                });
            }, modifyJob() {
                let param = {
                    ins_id: this.form.ins_id,
                    uid: this.identify,
                    jobName: this.form.jobName,
                    invokeParam: this.form.invokeParam,
                    jobGroup: this.form.jobGroup,
                    description: this.form.description,
                    triggerType: this.form.triggerType,
                    triggerConfig: null
                };
                let triggerConf = {
                    triggerGroup: this.form.jobGroup,
                    expression: this.form.expression,
                };
                if (this.form.immediately === '2') {
                    triggerConf['startAt'] = this.form.startAt.getTime();
                }
                param.triggerConfig = JSON.stringify(triggerConf);
                modifyCeJobConf(param).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            message: "修改任务成功!",
                            type: 'success'
                        });
                    } else {
                        this.$message.error({
                            message: "修改任务失败! " + resp.data.message
                        });
                    }
                    this.$parent.loadCeJobs();
                    this.dialog = false;
                }).catch((resp) => {
                    this.dialog = false;
                    this.$message.error({
                        message: "修改任务失败! " + resp.data.message
                    });
                });
            }, change(cron) {
                this.form.expression = cron
            },
            reset() {
                this.form.expression = "0/3 * * * * ?"
            }
        }
    }
</script>

<style scoped>

</style>
