<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <el-button type="primary" icon="el-icon-plus" size="mini" class="filter-item">新增</el-button>
        </div>
        <el-scrollbar style="height: 100%">
            <el-table style="width: 100%;margin-bottom: 20px;" :data="stJobs"
                      v-loading="loading" ref="stJobList">
                <el-table-column align="center" prop="job_name" label="任务名"/>
                <el-table-column align="center" prop="job_group" label="任务组"/>
                <el-table-column align="center" prop="trigger_type" label="触发器">
                    <template slot-scope="scope">
                        <el-tag :type="getTriggerType(scope.row.trigger_type).type">
                            {{getTriggerType(scope.row.trigger_type).label}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="job_describe" label="任务描述"/>
                <el-table-column align="center" prop="instance.instance_name" label="关联实例"/>
                <el-table-column align="center" prop="create_time" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_user" label="创建用户"/>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {dateFormat} from "../../../utils/utils";
    import {getStJobAll, getStJobByUser} from "../../../api/task/stat_task";


    export default {
        name: "StatTask",
        data() {
            return {
                loading: false, stJobs: [],
                triggerType: [{label: "Cron", value: 1, type: "primary"},
                    {label: "Simple", value: 1, type: "success"},
                    {label: "Calendar", value: 1, type: "warning"},
                    {label: "DailyTime", value: 1, type: "danger"}]
            }
        }, methods: {
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
            }, loadBackups() {
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
            }
        }
    }
</script>

<style scoped>

</style>