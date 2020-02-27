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
        <el-table style="width: 100%;margin-bottom: 20px;" height="400" :data="ceJobs" v-loading="loading"
                  ref="ceJobList">
            <el-table-column align="center" prop="job_name" label="任务ID"/>
            <el-table-column align="center" prop="instance.instance_name" width="250" label="关联实例"/>
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
            <el-table-column align="center" prop="id" label="命令">
                <template slot-scope="scope">
                    {{JSON.parse(scope.row.job_config).invokeParam.exe}}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" width="100" label="逻辑DB">
                <template slot-scope="scope">
                    {{JSON.parse(scope.row.job_config).invokeParam.db}}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="job_describe" label="任务描述">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.job_describe" effect="light" placement="top">
                        <div slot="content" style="word-wrap: break-word">
                            {{scope.row.job_describe}}
                        </div>
                        <el-link type="danger">详情</el-link>
                    </el-tooltip>
                    <a v-if="scope.row.job_describe===''">无</a>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="create_time" width="180" label="创建时间">
                <template slot-scope="scope">
                    {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="create_user" width="150" label="创建用户"/>
            <el-table-column align="center" label="操作" width="240px">
                <template slot-scope="scope">
                    <el-button v-if="rights('CETASK_CONF_UPDATE')" type="primary" icon="el-icon-edit" size="mini"
                               @click="changeJobConf(scope.row)"/>
                    <el-button v-if="rights('CETASK_STATE_UPDATE')" :type="getBtnType(scope.row)"
                               :icon="getBtnIcon(scope.row)" size="mini" @click="changeJobState(scope.row)"/>
                    <el-button v-if="rights('CETASK_STATE_UPDATE')" type="primary" icon="el-icon-postcard" size="mini"
                               @click="addTab(scope.row)"/>
                    <el-button v-if="rights('CETASK_DEL')" type="danger" icon="el-icon-delete" size="mini"
                               @click="deleteJob(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
        <el-divider content-position="left">执行日志</el-divider>
        <el-tabs style="height:100%;padding:10px;"
                 closable v-model="currentTabName" @tab-remove="removeTab">
            <el-tab-pane style="width:100%;height: 30vh" v-for="item in execTabs" :key="item.name" :label="item.title"
                         :name="item.name">
                <exec-log :ref="item.name" :appId="appId" :jobId="item.id"/>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import {dateFormat, guid} from "@/utils/utils";
    import {delCeJob, getCeJobAll, getCeJobById, getCeJobByUser, modifyCeJobState} from "@/api/task/ce_task";
    import CeJobForm from "@/views/task/execution/CeJobForm";
    import ExecLog from "@/views/task/execution/ExecLog";

    export default {
        name: "CmdExecute",
        components: {ExecLog, CeJobForm},
        data() {
            return {
                loading: false,
                ceJobs: [],
                identify: this.$store.getters.identify,
                appId: guid(),
                execTabs: [],
                currentTabName: '',
                triggerType: [{label: "Cron", value: 1, type: "primary"},
                    {label: "Simple", value: 0, type: "success"},
                    {label: "Calendar", value: 2, type: "warning"},
                    {label: "DailyTime", value: 3, type: "danger"}]
            }
        }, created() {
            this.$nextTick(() => {
                this.$wss.on("ceRev", this.msgRev, this.appId);
                this.$wss.on("wsOpen", () => {
                    this.startTrans();
                }, this.appId);
                this.$wss.connect(this.identify);
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
                            for (let i = 0; i < this.execTabs.length; i++) {
                                if (this.execTabs[i].id === row.id) {
                                    this.execTabs.splice(i, 1);
                                }
                            }
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
                        if (st) {
                            this.addTab(row)
                        }
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
                    interval: trigger.hasOwnProperty('interval') ? trigger.interval : 1,
                    repeatCount: trigger.hasOwnProperty('repeatCount') ? parseInt(trigger.repeatCount) : -1,
                    description: conf.description
                };
                if (trigger.hasOwnProperty('startAt')) {
                    _this.form.startAt = new Date(trigger.startAt);
                    _this.form.immediately = "2";
                }
                _this.dialog = true;
            }, addTab(job) {
                for (let i = 0; i < this.execTabs.length; i++) {
                    if (this.execTabs[i].id === job.id) {
                        return;
                    }
                }
                if (this.execTabs.length > 10) {
                    this.$message.error({
                        message: '新建日志框失败，最大支持10个日志框'
                    });
                    return;
                }
                let tab = {
                    id: job.id,
                    title: job.job_name,
                    name: job.job_name
                };
                this.execTabs.push(tab);
                this.currentTabName = tab.name;
            }, removeTab(targetName) {
                let tabs = this.execTabs;
                let activeName = this.currentTabName;
                if (activeName === targetName) {
                    tabs.forEach((tab, index) => {
                        if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeName = nextTab.name;
                            }
                        }
                    });
                }
                this.currentTabName = activeName;
                this.execTabs = tabs.filter(tab => tab.name !== targetName);
                delete this.$refs[targetName]
            }, msgRev(e) {
                if (e.body.hasOwnProperty("jobId")) {
                    for (let key in this.$refs) {
                        if (key === e.body.jobId) {
                            let res = e.body;
                            res.cost = e.cost;
                            res.time = e.time;
                            this.$refs[key][0].updateLog(res);
                        }
                    }
                }
            }, startTrans() {
                if (this.$wss.isConnected) {
                    this.$wss.send("", 100, this.appId, '', 'execution');
                }
            }, stopTrans() {
                this.$wss.send("", 101, this.appId, '', 'execution');
            }
        }, beforeDestroy() {
            this.stopTrans();
            this.$wss.un("ceRev", this.appId);
            this.$wss.un("wsOpen", this.appId);
            this.$wss.close();
        }
    }
</script>

<style scoped>
    >>> .el-divider--horizontal {
        margin: 0 !important;
    }
</style>