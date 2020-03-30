<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input v-if="rights('BACKUP_SEARCH')" clearable v-model="query.name" placeholder="输入文件名称搜索"
                      style="width: 200px;" size="mini" class="filter-item"/>
            <el-select v-if="rights('BACKUP_SEARCH')" v-model="query.backup_type" clearable placeholder="类型"
                       @change="queryRecords" class="filter-item" style="width: 90px" size="mini" value="">
                <el-option v-for="item in backupTypes" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
            <el-date-picker v-model="query.range" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                            size="mini" end-placeholder="结束日期">
            </el-date-picker>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="queryRecords"
                       v-if="rights('BACKUP_SEARCH')">搜索
            </el-button>
            <el-button v-if="rights('BACKUP_QUERY')||rights('BACKUP_QUERY_ALL')" type="danger" @click="loadBackups"
                       icon="el-icon-refresh" size="mini"/>
            <el-button v-if="rights('BACKUP_MULTI_DEL')" type="warning" @click="deleteMultiBackups"
                       icon="el-icon-delete" size="mini">批量删除备份
            </el-button>
            <el-button v-if="rights('BACKUP_CLEAR')" type="warning" @click="clearBackups"
                       icon="el-icon-delete" size="mini">清空备份
            </el-button>
        </div>
        <el-scrollbar style="height: 100%">
            <el-table :data="backups" @selection-change="handlerTableSelect" style="width: 100%;margin-bottom: 20px;"
                      v-loading="loading" :stripe="true" ref="backupList">
                <el-table-column align="center" type="selection" width="55"/>
                <el-table-column align="center" width="250" prop="filename" label="名称"/>
                <el-table-column align="center" prop="size" label="文件大小">
                    <template slot-scope="scope">
                        <el-tag type="primary">{{sizeFormat(scope.row.size)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="backup_type" label="备份类型">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.backup_type==='dump'?'primary':'danger'">{{scope.row.backup_type}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="dl_count" label="下载次数"/>
                <el-table-column align="center" prop="last_down" label="上次下载">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",scope.row.last_down)}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_time" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_user" label="创建用户"/>
                <el-table-column align="center" label="操作" width="200px">
                    <template slot-scope="scope">
                        <el-button v-if="rights('BACKUP_DOWNLOAD')" type="primary" @click="downloadBack(scope.row.id)"
                                   icon="el-icon-download" size="mini"/>
                        <el-button v-if="rights('BACKUP_DEL')" type="danger" @click="deleteBackup(scope.row.id)"
                                   icon="el-icon-delete" size="mini"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {
        clearBackup,
        deleteBackupRecord,
        deleteMultiBackup,
        getBackupAll,
        getBackupList,
        queryBackup
    } from "../../../api/redismanage/redis_backup";
    import {dateFormat} from "../../../utils/utils";

    export default {
        name: "BackupManage",
        data() {
            return {
                backups: [], loading: false, selection: [],
                query: {
                    name: "",
                    backup_type: '',
                    range: null
                },
                backupTypes: [{value: "dump", label: "RDB备份"}, {value: "decode", label: "Decode结果"}]
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadBackups();
            })
        },
        methods: {
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, dateFormat(fmt, dt) {
                if (dt == null) {
                    return '';
                }
                return dateFormat(fmt, new Date(dt));
            }, sizeFormat(size) {
                if (size < 1024) {
                    return size + "B";
                } else if (size > 1024 && size < Math.pow(1024, 2)) {
                    return Number(size / 1024).toFixed(2) + "KB";
                } else if (size > Math.pow(1024, 2) && size < Math.pow(1024, 3)) {
                    return Number(size / Math.pow(1024, 2)).toFixed(2) + "MB";
                } else {
                    return Number(size / Math.pow(1024, 3)).toFixed(2) + "GB";
                }
            }, loadBackups() {
                this.selection = [];
                if (!this.rights("BACKUP_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("BACKUP_QUERY_ALL")) {
                    this.backups = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadAll() {
                this.loading = true;
                getBackupAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.backups = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    if (Object.prototype.hasOwnProperty.call(resp, ["data"])) {
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
                getBackupList().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.backups = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    if (Object.prototype.hasOwnProperty.call(resp, ["data"])) {
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
            }, queryRecords() {
                let params = {
                    filename: this.query.name,
                    backup_type: this.query.backup_type,
                };
                if (this.query.range != null) {
                    params.std = this.query.range[0].toString();
                    params.etd = this.query.range[1].toString();
                }
                queryBackup(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.backups = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    if (Object.prototype.hasOwnProperty.call(resp, ["data"])) {
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
                        this.loadBackups();
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
            }, downloadBack(bid) {
                window.open(this.$store.getters.baseUrl + "/backup/download/" + bid, "_blank");
                this.loadBackups();
            }, clearBackups() {
                this.$confirm('将清空备份文件及数据库记录, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    clearBackup().then((resp) => {
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
                        this.loadBackups();
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
            }, deleteMultiBackups() {
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
                this.$confirm('将删除选中备份记录及文件, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteMultiBackup({ids: deletes}).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!" + resp.data.message,
                                type: 'success'
                            });
                            this.loadBackups()
                        } else {
                            this.$message.error({
                                message: "删除失败!" + resp.data.message
                            });
                        }
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
            }
        }
    }
</script>

<style scoped>

</style>