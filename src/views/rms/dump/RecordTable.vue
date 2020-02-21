<template>
    <el-table :data="shakeRecords" height="50%" style="height:50%;" size="mini" @selection-change="handlerTableSelect">
        <el-table-column align="center" type="selection" width="55"/>
        <el-table-column prop="source_name" align="center" label="源实例名"/>
        <el-table-column prop="target_name" align="center" label="目标实例名"/>
        <el-table-column align="center" width="80" label="类型">
            <template slot-scope="scope">
                <el-tag size="mini" :type="getTagType(scope.row.shake_type)">
                    {{scope.row.shake_type}}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="result" width="80" align="center" label="结果">
            <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.result==='success'?'success':'error'">
                    {{scope.row.result}}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="create_time" width="140" align="center" label="时间">
            <template slot-scope="scope">
                {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
            </template>
        </el-table-column>
        <el-table-column prop="create_user" width="150" align="center" label="用户"/>
        <el-table-column prop="id" width="150" align="center" label="操作">
            <template slot-scope="scope">
                <el-popover v-if="scope.row.shake_type==='dump'||scope.row.shake_type==='decode'"
                            placement="left-start"
                            title="备份信息"
                            width="300"
                            trigger="hover"
                            @show="getBackup(scope.row.relate_backup)"
                            content="">
                    <el-row v-if="backupInfo===null||backupInfo==={}">
                        未找到备份文件
                    </el-row>
                    <div v-if="backupInfo!==null&&backupInfo!=={}">
                        <el-row class="dump-info">
                            <el-col :span="8">备份文件名:</el-col>
                            <el-col :span="16">{{backupInfo.filename}}</el-col>
                        </el-row>
                        <el-row class="dump-info">
                            <el-col :span="8">文件大小:</el-col>
                            <el-col :span="16">{{Number(backupInfo.size/1024).toFixed(2)+'KB'}}</el-col>
                        </el-row>
                        <el-row class="dump-info">
                            <el-col :span="8">文件类型:</el-col>
                            <el-col :span="16">{{backupInfo.backup_type==='dump'?'RDB备份':'JSON解析结果'}}</el-col>
                        </el-row>
                        <el-row class="dump-info">
                            <el-col :span="8">备份时间:</el-col>
                            <el-col :span="16">{{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(backupInfo.create_time))}}
                            </el-col>
                        </el-row>
                        <el-row class="dump-info">
                            <el-col :span="8">下载次数:</el-col>
                            <el-col :span="16">{{backupInfo.dl_count+'次'}}</el-col>
                        </el-row>
                        <el-row v-if="backupInfo.last_down!==null" class="dump-info">
                            <el-col :span="8">下载次数:</el-col>
                            <el-col :span="16">{{backupInfo.dl_count+'次'}}</el-col>
                        </el-row>
                        <el-row class="dump-info">
                            <el-col :span="8">操作:</el-col>
                            <el-col :span="16">
                                <el-button type="text" size="mini" @click="downloadBack(backupInfo.id)">下载</el-button>
                                <el-button type="text" size="mini" @click="deleteBackup(backupInfo.id)">删除</el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <el-button slot="reference" size="mini" type="text" style="margin-right: 15px">备份信息</el-button>
                </el-popover>
                <el-button size="mini" v-if="rights('DUMP_DEL_RECORD')" @click="deleteRecord(scope.row.id)" type="text">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
    import {
        clearShake,
        deleteMultiShake,
        deleteShakeRecord,
        getShakes,
        getShakesByUser
    } from "../../../api/redismanage/redis_dump";
    import {dateFormat} from "../../../utils/utils";
    import {deleteBackupRecord, getBackupInfo} from "../../../api/redismanage/redis_backup";

    export default {
        name: "RecordTable",
        props: {
            instances: {
                type: Array,
                required: true
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadShakeRec();
            })
        },
        data() {
            return {
                shakeRecords: [], backupInfo: null, selection: []
            }
        }, methods: {
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            }, getTagType(item) {
                switch (item) {
                    case"dump":
                        return "success";
                    case"rump":
                        return "warning";
                    case"sync":
                        return "danger";
                    case"restore":
                        return "info";
                    case"decode":
                        return "primary";
                }
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadShakeRec() {
                this.selection = [];
                if (!this.rights("DUMP_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("DBA_QUERY_ALL")) {
                    this.shakeRecords = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadAll() {
                getShakes().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.shakeRecords = this.parseRecords(resp.data.message);
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
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
                });
            }, loadByUser() {
                getShakesByUser().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.shakeRecords = this.parseRecords(resp.data.message);
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
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
                });
            }, deleteRecord(id) {
                this.$confirm('将删除该条记录及关联备份文件, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteShakeRecord(id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!",
                                type: 'success'
                            });
                        } else {
                            this.$message.error({
                                message: "删除失败!"
                            });
                        }
                        this.loadShakeRec();
                    }).catch(() => {
                        this.$message.error({
                            message: "删除失败!"
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }, parseRecords(records) {
                for (let i = 0; i < records.length; i++) {
                    for (let j = 0; j < this.instances.length; j++) {
                        if (records[i].source_ins === this.instances[j].id) {
                            records[i].source = this.instances[j];
                            records[i].source_name = this.instances[j].label;
                        }
                        if (records[i].target_ins === this.instances[j].id) {
                            records[i].target = this.instances[j];
                            records[i].target_name = this.instances[j].label;
                        }
                    }
                }
                return records;
            }, getBackup(bk_id) {
                getBackupInfo(bk_id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.backupInfo = resp.data.message;
                    } else {
                        this.backupInfo = null;
                    }
                }).catch(() => {
                    this.$message.error({
                        message: "查询备份信息失败!"
                    });
                    this.backupInfo = null;
                })
            }, downloadBack(bid) {
                window.open(this.$store.getters.baseUrl + "/backup/download/" + bid, "_blank");
            }, deleteBackup(id) {
                this.$confirm('将永久删除该备份文件, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteBackupRecord(id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!",
                                type: 'success'
                            });
                        } else {
                            this.$message.error({
                                message: "删除失败!"
                            });
                        }
                        this.loadShakeRec();
                    }).catch(() => {
                        this.$message.error({
                            message: "删除失败!"
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }, handlerTableSelect(selects) {
                this.selection = selects;
            }, deleteMultiShakes() {
                if (this.selection.length === 0) {
                    this.$message({
                        message: "请先选中数据",
                        type: 'warning'
                    });
                    return;
                }
                let deletes = [];
                for (let i = 0; i < this.selection.length; i++) {
                    deletes.push(this.selection[i].id);
                }
                this.$confirm('将删除选中操作记录及关联备份, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteMultiShake({ids: deletes}).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!" + resp.data.message,
                                type: 'success'
                            });
                        } else {
                            this.$message.error({
                                message: "删除失败!" + resp.data.message
                            });
                        }
                        this.loadShakeRec();
                    }).catch((resp) => {
                        this.$message.error({
                            message: "删除失败!" + resp.data.message
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }, clearShakes() {
                this.$confirm('将清空数据操作记录及关联备份, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    clearShake().then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!",
                                type: 'success'
                            });
                        } else {
                            this.$message.error({
                                message: "删除失败!"
                            });
                        }
                        this.loadShakeRec();
                    }).catch(() => {
                        this.$message.error({
                            message: "删除失败!"
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }
        }
    }
</script>

<style scoped>
    .dump-info {
        border-bottom: 1px solid #dddddd;
    }
</style>
