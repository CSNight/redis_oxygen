<template>
    <div>
        <ce-job-form ref="ceJobForm"/>
        <div class="head-container">
            <el-button v-if="rights('CETASK_ADD')" type="primary" icon="el-icon-plus" size="mini" class="filter-item"
                       @click="newJob">新增
            </el-button>
            <el-button v-if="rights('CETTASK_QUERY')||rights('CETASK_QUERY_ALL')" type="danger" icon="el-icon-refresh"
                       size="mini" @click="loadCeJobs"/>
        </div>
        <el-scrollbar style="height: 100%">
            <el-table style="width: 100%;margin-bottom: 20px;" :data="ceJobs" v-loading="loading" ref="ceJobList">
                <el-table-column align="center" prop="instance.instance_name" width="250" label="关联实例"/>
                <el-table-column align="center" prop="job_group" width="100" label="任务组"/>
                <el-table-column align="center" prop="trigger_type" width="100" label="触发器">
                    <template slot-scope="scope">
                        <el-tag size="mini" :type="getTriggerType(scope.row.trigger_type).type">
                            {{getTriggerType(scope.row.trigger_type).label}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="state" width="100" label="状态">
                    <template slot-scope="scope">
                        <el-tag size="mini" :type="scope.row.state==='NORMAL'?'success':'danger'">
                            {{scope.row.state==='NORMAL'?'运行中':'已停止'}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="id" width="100" label="命令">
                    <template slot-scope="scope">
                        {{JSON.parse(scope.row.job_config).invokeParam.exe}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="id" width="100" label="逻辑DB">
                    <template slot-scope="scope">
                        {{JSON.parse(scope.row.job_config).invokeParam.db}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="id" width="100" label="执行次数">
                    <template slot-scope="scope">
                        {{JSON.parse(scope.row.job_config).invokeParam.times}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="job_describe" label="任务描述"/>
                <el-table-column align="center" prop="create_time" width="180" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_user" width="150" label="创建用户"/>
                <el-table-column align="center" label="操作" width="200px">
                    <template slot-scope="scope">
                        <el-button v-if="rights('CETASK_CONF_UPDATE')" type="primary" icon="el-icon-edit" size="mini"
                                   @click="changeJobConf(scope.row)"/>
                        <el-button v-if="rights('CETASK_STATE_UPDATE')" :type="getBtnType(scope.row)"
                                   :icon="getBtnIcon(scope.row)" size="mini"
                                   @click="changeJobState(scope.row)"/>
                        <el-button v-if="rights('CETASK_DEL')" type="danger" icon="el-icon-delete" size="mini"
                                   @click="deleteJob(scope.row)"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {dateFormat} from "@/utils/utils";
    import {delCeJob, getCeJobAll, getCeJobById, getCeJobByUser, modifyCeJobState} from "@/api/task/ce_task";
    import CeJobForm from "@/views/task/execution/CeJobForm";

    export default {
        name: "CmdExecute",
        components: {CeJobForm},
        data() {
            return {
                loading: false, ceJobs: [],
                triggerType: [{label: "Cron", value: 1, type: "primary"},
                    {label: "Simple", value: 1, type: "success"},
                    {label: "Calendar", value: 1, type: "warning"},
                    {label: "DailyTime", value: 1, type: "danger"}]
            }
        }, created() {
            this.$nextTick(() => {
                this.loadCeJobs();
            })
        }, methods: {
            getBtnIcon(row) {
                return row.state === "NORMAL" ? 'el-icon-switch-button' : 'fa fa-play'
            },
            getBtnType(row) {
                return row.state === "NORMAL" ? 'warning' : 'success'
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, dateFormat(fmt, dt) {
                if (dt == null) {
                    return '';
                }
                return dateFormat(fmt, new Date(dt));
            }, getExpression(row) {
                return JSON.parse(JSON.parse(row.job_config).triggerConfig).expression;
            }, getTriggerType(t) {
                for (let i = 0; i < this.triggerType.length; i++) {
                    if (t === this.triggerType[i].value) {
                        return this.triggerType[i];
                    }
                }
            }, loadCeJobs() {
                if (!this.rights("CETTASK_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("CETASK_QUERY_ALL")) {
                    this.ceJobs = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadAll() {
                this.loading = true;
                getCeJobAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.ceJobs = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        })
                    }
                    this.loading = false;
                }).catch((resp) => {
                    if (resp.hasOwnProperty("data")) {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.message
                        });
                    }
                    this.loading = false;
                });
            }, loadByUser() {
                this.loading = true;
                getCeJobByUser().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.ceJobs = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    if (resp.hasOwnProperty("data")) {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.message
                        });
                    }
                    this.loading = false;
                });
            }, loadById(jid) {
                getCeJobById(jid).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let insNew = resp.data.message;
                        for (let i = 0; i < this.ceJobs.length; i++) {
                            if (this.ceJobs[i].id === insNew.id) {
                                this.$set(this.ceJobs, i, insNew);
                                break;
                            }
                        }
                    } else {
                        this.$message.error({
                            message: "刷新出错!" + resp.data.message
                        });
                    }
                }).catch(() => {
                    this.$message.error({
                        message: "刷新出错!"
                    });
                });
            }, newJob() {
                this.$refs.ceJobForm.isAdd = true;
                this.$refs.ceJobForm.dialog = true;
            }, deleteJob(row) {
                this.$confirm('将删除此命令执行任务, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delCeJob(row.id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '删除失败:' + resp.data.message
                            });
                        }
                        this.loadCeJobs();
                    }).catch(() => {
                        this.loadCeJobs();
                        this.$message.error({
                            message: "删除错误"
                        });
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }, changeJobState(row) {
                let st = !(row.state === "NORMAL");
                let prefix = st ? "启动" : "停止";
                modifyCeJobState(row.id, !(row.state === "NORMAL")).then((resp) => {
                    if (resp.data.status === 200 && resp.data.message === "success") {
                        this.$message({
                            type: 'success',
                            message: '任务' + prefix + "成功!"
                        });
                    } else {
                        this.$message.error({
                            message: '任务' + prefix + "失败! " + resp.data.message
                        });
                    }
                    this.loadById(row.id);
                }).catch(() => {
                    this.$message.error({
                        message: '任务' + prefix + "失败!"
                    });
                    this.loadById(row.id);
                });
            }, changeJobConf(row) {
                let _this = this.$refs.ceJobForm;
                let conf = JSON.parse(row.job_config);
                let trigger = JSON.parse(conf.triggerConfig);
                _this.isAdd = false;
                _this.form = {
                    uid: conf.uid,
                    jobName: conf.jobName,
                    ins_id: conf.invokeParam.ins_id,
                    db: parseInt(conf.invokeParam.db),
                    invokeParam: conf.invokeParam.exe,
                    triggerType: conf.triggerType,
                    immediately: '1',
                    expression: trigger.expression,
                    startAt: null,
                    jobGroup: conf.jobGroup,
                    timeUnit: 'SECOND',
                    interval: trigger.hasOwnProperty('interval') ? conf.interval : 1,
                    repeatCount: trigger.hasOwnProperty('repeatCount') ? conf.repeatCount : -1,
                    description: conf.description
                };
                if (trigger.hasOwnProperty('startAt')) {
                    _this.form.startAt = new Date(trigger.startAt);
                    _this.form.immediately = "2";
                }
                _this.dialog = true;
            }
        }
    }
</script>

<style scoped>

</style>