<template>
    <div>
        <div class="head-container">
            <el-input clearable v-model="query.key" placeholder="输入收件人模糊搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-date-picker v-model="query.st_et" size="mini" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期">
            </el-date-picker>
            <el-button v-if="rights('MAIL_REC_SEARCH')" class="filter-item" size="mini" type="success"
                       icon="el-icon-search" @click="loadQuery">搜索
            </el-button>
            <el-button v-if="rights('MAIL_REC_ALL')||rights('MAIL_REC_QUERY')" type="primary" icon="el-icon-refresh"
                       size="mini" @click="loadData()"/>
            <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete"
                       v-if="rights('MAIL_REC_CLEAR')" @click="deleteMultiRec">批量删除
            </el-button>
        </div>
        <el-table ref="filterTable" height="650" :data="records" v-loading="loading"
                  @selection-change="handlerTableSelect">
            <el-table-column align="center" type="selection" width="55" row-key="id"/>
            <el-table-column prop="theme" align="center" label="主题">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.theme.length>15" effect="light" :content="scope.row.theme">
                        <a>{{scope.row.theme.substr(0,15)+'...'}}</a>
                    </el-tooltip>
                    <a v-if="scope.row.theme.length<15">{{scope.row.theme}}</a>
                </template>
            </el-table-column>
            <el-table-column prop="mt" align="center" label="邮件类型" width="100"
                             :filters="[{text: 'CUSTOM', value: 'CUSTOM'},{text: 'SYSTEM', value: 'SYSTEM'}]"
                             :filter-method="filterHandler">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="scope.row.mt==='CUSTOM'?'primary':'danger'">{{scope.row.mt}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="email" align="center" label="发件人"/>
            <el-table-column prop="tos" align="center" label="收件人">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.tos" effect="light" placement="top">
                        <div slot="content"><a v-for="(item,i) in scope.row.tos.split(';')" :key="i">{{item}}<br></a>
                        </div>
                        <el-link type="primary">{{scope.row.tos.split(';')[0]+'...'}}</el-link>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="status" align="center" label="状态" width="100"
                             :filters="[{text: 'sending', value: 'sending'},{text: 'success', value: 'success'},{text: 'failed', value: 'failed'}]"
                             :filter-method="filterHandler">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="getStatusType(scope.row.status)">{{scope.row.status.toUpperCase()}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="reason" align="center" label="失败原因" width="80">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.reason" effect="light" placement="top">
                        <div slot="content">
                            <a v-for="(item,i) in scope.row.reason.split(':')" :key="i">{{item}}<br></a>
                        </div>
                        <el-link type="danger">详情</el-link>
                    </el-tooltip>
                    <a v-if="!scope.row.reason">无</a>
                </template>
            </el-table-column>
            <el-table-column prop="create_user" align="center" label="用户"/>
            <el-table-column prop="ct" align="center" label="发送时间" width="160">
                <template slot-scope="scope">
                    {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.ct))}}
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="250px">
                <template slot-scope="scope">
                    <el-button v-if="rights('MAIL_REC_ID')" type="primary" icon="el-icon-refresh"
                               @click="loadById(scope.row)" size="mini"/>
                    <el-button v-if="rights('MAIL_REC_DEL')" type="danger" icon="el-icon-delete" size="mini"
                               @click="deleteById(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {
        deleteMultiRecords,
        deleteRecordById,
        getAllRecords,
        getRecordById,
        getUserRecords, queryRecords
    } from "@/api/system/mail_api";
    import {dateFormat} from "@/utils/utils";

    export default {
        name: "MailRecord",
        data() {
            return {
                records: [], loading: false, selection: [], query: {st_et: [], key: ''}
            }
        },
        methods: {
            clearFilter() {
                this.$refs.filterTable.clearFilter();
            },
            filterHandler(value, row, column) {
                const property = column['property'];
                return row[property] === value;
            },
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            },
            getStatusType(st) {
                switch (st) {
                    case"sending":
                        return "warning";
                    default:
                    case"success":
                        return "success";
                    case"failed":
                        return "danger";
                }
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadData() {
                this.clearFilter();
                this.query.key = '';
                this.query.st_et = [];
                if (!this.rights("MAIL_REC_ALL") && !this.rights("MAIL_REC_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("MAIL_REC_ALL")) {
                    this.loading = true;
                    this.records = [];
                    this.loadAll();
                } else {
                    this.records = [];
                    this.loadByUser();
                }
            }, loadByUser() {
                getUserRecords().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.records = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                });
            }, loadAll() {
                getAllRecords().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.records = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                });
            }, loadById(row) {
                getRecordById(row.id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let recNew = resp.data.message;
                        for (let i = 0; i < this.records.length; i++) {
                            if (this.records[i].id === recNew.id) {
                                this.$set(this.records, i, recNew);
                                break;
                            }
                        }
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                }).catch(() => {
                    this.$message.error({
                        message: "查询出错!"
                    });
                })
            }, loadQuery() {
                let params = {};
                if (this.query.st_et !== null && this.query.st_et.length !== 0) {
                    params['std'] = this.query.st_et[0].toString();
                    params['etd'] = this.query.st_et[1].toString();
                }
                if (this.query.key != null && this.query.key !== '') {
                    params['receiver'] = this.query.key;
                }
                queryRecords(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.records = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.response.data.message
                    });
                })
            }, deleteById(row) {
                this.$confirm('将删除该条邮件记录, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteRecordById(row.id).then((resp) => {
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
                        this.loadData();
                    }).catch(() => {
                        this.loadData();
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
            }, handlerTableSelect(selects) {
                this.selection = selects;
            }, deleteMultiRec() {
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
                this.$confirm('将删除选中的邮件记录, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteMultiRecords({ids: deletes}).then((resp) => {
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
                        this.loadData();
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

</style>