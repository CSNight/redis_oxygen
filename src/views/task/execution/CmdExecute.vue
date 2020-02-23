<template>
    <div>
        <div class="head-container">
            <el-button type="primary" icon="el-icon-plus" size="mini" class="filter-item">新增</el-button>
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
                <el-table-column align="center" prop="job_describe" label="任务描述"/>
                <el-table-column align="center" prop="create_time" width="180" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_user" width="150" label="创建用户"/>
                <el-table-column align="center" label="操作" width="200px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit"
                                   size="mini"/>
                        <el-button :type="getBtnType(scope.row)" :icon="getBtnIcon(scope.row)" size="mini"/>
                        <el-button type="danger" icon="el-icon-delete"
                                   size="mini"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {dateFormat} from "@/utils/utils";
    import {getCeJobAll, getCeJobById, getCeJobByUser} from "@/api/task/ce_task";

    export default {
        name: "CmdExecute",
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
                        for (let i = 0; i < this.stJobs.length; i++) {
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
            }
        }
    }
</script>

<style scoped>

</style>