<template>
    <div>
        <st-job-form ref="stJobForm"></st-job-form>
        <!--工具栏-->
        <div class="head-container">
            <el-button type="primary" icon="el-icon-plus" size="mini" class="filter-item" @click="newJob">新增</el-button>
            <el-button v-if="rights('STTASK_QUERY')||rights('STTASK_QUERY_ALL')" type="danger" icon="el-icon-refresh"
                       size="mini" @click="loadStJobs"/>
        </div>
        <el-scrollbar style="height: 100%">
            <el-table style="width: 100%;margin-bottom: 20px;" :data="stJobs"
                      v-loading="loading" ref="stJobList">
                <el-table-column align="center" prop="job_name" width="300" label="任务名"/>
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
                <el-table-column align="center" prop="job_describe" label="任务描述"/>
                <el-table-column align="center" prop="instance.instance_name" width="250" label="关联实例"/>
                <el-table-column align="center" prop="create_time" width="180" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_user" width="150" label="创建用户"/>
                <el-table-column align="center" label="操作" width="250px">
                    <template slot-scope="scope">
                        <el-button v-if="rights('STTASK_DEL')" type="primary" icon="el-icon-edit"
                                   @click="changeJobConf" size="mini"/>
                        <el-button v-if="rights('STTASK_STATE_UPDATE')" :type="getBtnType(scope.row)"
                                   :icon="getBtnIcon(scope.row)"
                                   @click="changeJobState(scope.row)" size="mini"/>
                        <el-button v-if="rights('STTASK_DEL')" type="danger" icon="el-icon-delete"
                                   @click="deleteJob(scope.row)" size="mini"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {dateFormat} from "../../../utils/utils";
    import {delStJob, getStJobAll, getStJobById, getStJobByUser, modifyStJobState} from "../../../api/task/stat_task";
    import StJobForm from "./StJobForm";

    export default {
        name: "StatTask",
        components: {StJobForm},
        data() {
            return {
                loading: false, stJobs: [],
                triggerType: [{label: "Cron", value: 1, type: "primary"},
                    {label: "Simple", value: 1, type: "success"},
                    {label: "Calendar", value: 1, type: "warning"},
                    {label: "DailyTime", value: 1, type: "danger"}]
            }
        }, created() {
            this.$nextTick(() => {
                this.loadStJobs();
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
            }, getTriggerType(t) {
                for (let i = 0; i < this.triggerType.length; i++) {
                    if (t === this.triggerType[i].value) {
                        return this.triggerType[i];
                    }
                }
            }, loadStJobs() {
                if (!this.rights("STTASK_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("STTASK_QUERY_ALL")) {
                    this.stJobs = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadAll() {
                this.loading = true;
                getStJobAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.stJobs = resp.data.message;
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
                getStJobByUser().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.stJobs = resp.data.message;
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
                getStJobById(jid).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let insNew = resp.data.message;
                        for (let i = 0; i < this.stJobs.length; i++) {
                            if (this.stJobs[i].id === insNew.id) {
                                this.$set(this.stJobs, i, insNew);
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
                this.$refs.stJobForm.dialog = true;
            }, deleteJob(row) {
                this.$confirm('将删除此实例统计任务, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delStJob(row.instance.id).then((resp) => {
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
                        this.loadStJobs();
                    }).catch(() => {
                        this.loadStJobs();
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
                modifyStJobState(row.instance.id, !(row.state === "NORMAL")).then((resp) => {
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
                        message: '已取消任务状态变更'
                    });
                    this.loadById(row.id);
                });
            }, changeJobConf() {

            }
        }
    }
</script>

<style scoped>

</style>
