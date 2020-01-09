<template>
    <div>
        <key-nx-form ref="nxForm"/>
        <div class="head-container">
            <el-input v-if="rights('KEYS_KEY_SCAN')" clearable v-model="match" placeholder="输入键名称搜索"
                      style="width: 200px;" size="mini" class="filter-item"/>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-refresh"
                       v-if="rights('KEYS_KEY_SCAN')" @click="triggerScan">搜索
            </el-button>
            <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete"
                       v-if="rights('DBA_FLUSH_DB')" @click="flushDb">清空当前数据库
            </el-button>
            <el-button class="filter-item" size="mini" type="warning" icon="el-icon-timer"
                       v-if="rights('KEYS_KEY_EXPIRE')" @click="setMultiNx">批量设置过期
            </el-button>
            <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete"
                       v-if="rights('KEYS_KEY_DELETE')" @click="deleteMultiKeys">批量删除键
            </el-button>
        </div>
        <el-card style="height:83vh;margin-left: 10px">
            <div slot="header">
                <span>数据列表</span>
            </div>
            <el-table :data="keyDt" height="40vh" style="width: 100%;margin-bottom: 20px;"
                      row-key="name" v-loading="loading" @selection-change="handlerTableSelect">
                <el-table-column align="center" type="selection" width="55"/>
                <el-table-column prop="id" width="80" align="center" label="id"/>
                <el-table-column prop="key" sortable align="center" label="键"/>
                <el-table-column prop="type" width="120" align="center" label="类型" :filters="filters"
                                 :filter-method="filterHandler">
                    <template slot-scope="scope">
                        <el-tag size="mini" :type="getTagType(scope.row.type)">{{scope.row.type}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="size" width="150" align="center" label="长度"/>
                <el-table-column prop="ttl" width="150" sortable align="center" label="过期时间"/>
                <el-table-column align="center" label="操作" width="200px">
                    <template slot-scope="scope">
                        <el-button v-if="rights('KEYS_KEY_REFRESH')" @click="refresh(scope.row)" type="text"
                                   size="small">
                            刷新
                        </el-button>
                        <el-button v-if="rights('KEYS_KEY_EXPIRE')" @click="setNx(scope.row)" type="text" size="small">
                            NX
                        </el-button>
                        <el-button v-if="rights('KEYS_KEY_VAL')" @click="viewKey(scope.row)" type="text" size="small">
                            查看
                        </el-button>
                        <el-button v-if="rights('KEYS_KEY_DELETE')" @click="deleteKey(scope.row)" type="text"
                                   size="small">删除
                        </el-button>
                    </template>
                </el-table-column>
                <infinite-loading ref="loader" slot="append" spinner="bubbles" @infinite="infiniteHandler"
                                  force-use-infinite-wrapper=".el-table__body-wrapper">
                </infinite-loading>
            </el-table>
            <value-viewer ref="viewer" :db="db" :ins="ins"/>
        </el-card>
    </div>
</template>

<script>
    import {deleteKeys, getKeyValue, insScanKey, refreshKey} from "../../../api/redismanage/redis_keys";
    import InfiniteLoading from 'vue-infinite-loading';
    import {insFlushDb} from "../../../api/redismanage/redis_dba";
    import {guid} from "../../../utils/utils";
    import KeyNxForm from "../../../views/rms/dtmanage/KeyNxForm";
    import ValueViewer from "../../../views/rms/dtmanage/ValueViewer";

    export default {
        name: "KeyTable",
        components: {ValueViewer, KeyNxForm, InfiniteLoading},
        props: {
            total: {
                type: Number,
                required: true
            }, db: {
                type: Number,
                required: true
            }, ins: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: false,
                keyDt: [], cur: 1, cursor: '0', match: '', appId: guid(), selection: [], viewKeyItem: {},
                filters: [
                    {text: "String", value: "string"},
                    {text: "Set", value: "Set"},
                    {text: "List", value: "List"},
                    {text: "ZSet", value: "zset"},
                    {text: "Hash", value: "hash"}]
            }
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            getTagType(type) {
                switch (type) {
                    default:
                    case"string":
                        return "primary";
                    case"list":
                        return "success";
                    case"set":
                        return "warning";
                    case"zset":
                        return "danger";
                    case"hash":
                        return "info";
                }
            },
            infiniteHandler($state) {
                this.loadBatch($state);
            }, loadBatch(inf) {
                insScanKey({
                    cursor: this.cursor,
                    match: this.match + "*",
                    count: 100,
                    db: this.db,
                    ins_id: this.ins,
                }).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let nks = resp.data.message.keys;
                        for (let i = 0; i < nks.length; i++) {
                            nks[i]['id'] = this.keyDt.length + 1;
                            this.keyDt.push(nks[i]);
                        }
                        this.cursor = resp.data.message.cursor;
                        if (this.cursor === '0') {
                            inf.complete();
                        }
                    }
                    if (inf) {
                        inf.loaded();
                    }
                }).catch(() => {
                    if (inf) {
                        inf.error();
                    }
                });
            }, viewKey(row) {
                let params = {
                    db: this.db,
                    ins_id: this.ins,
                    keyName: row.key,
                    ttl: row.ttl,
                    type: row.type
                };
                getKeyValue(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.viewKeyItem = JSON.parse(JSON.stringify(row));
                        this.viewKeyItem.val = resp.data.message[row.key];
                        this.$refs.viewer.$set(this.$refs.viewer, 'key', this.viewKeyItem);
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                })
            }, deleteKey(row) {
                let params = {
                    db: this.db,
                    ins_id: this.ins,
                    keyName: row.key,
                    keys: [row.key],
                    ttl: row.ttl,
                    type: row.type
                };
                this.$confirm('将删除该条数据, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteKeys(params).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!" + resp.data.message,
                                type: 'success'
                            });
                            //清除正在查看的键值
                            if (row.key === this.viewKeyItem.key) {
                                this.$refs.viewer.$set(this.$refs.viewer, 'key', {});
                                this.viewKeyItem = {};
                            }
                            //操作列表删除
                            this.keyDt.splice(this.keyDt.indexOf(row), 1);
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
            }, refresh(row) {
                let params = {
                    db: this.db,
                    ins_id: this.ins,
                    keyName: row.key,
                    ttl: row.ttl,
                    type: row.type
                };
                refreshKey(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            message: "刷新成功!",
                            type: 'success'
                        });
                        let keyInfo = resp.data.message;
                        row.ttl = keyInfo.ttl;
                        row.size = keyInfo.size
                    } else {
                        this.$message.error({
                            message: "刷新失败!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "刷新失败!" + resp.data.message
                    });
                })
            }, setNx(row) {
                const _this = this.$refs.nxForm;
                _this.form = JSON.parse(JSON.stringify(row));
                _this.form.keys = [row.key];
                _this.form.db = this.db;
                _this.form.keyName = row.key;
                _this.form.ins_id = this.ins;
                _this.dialog = true;
            }, filterHandler(value, row, column) {
                const property = column['property'];
                return row[property] === value;
            }, triggerScan() {
                this.cursor = '0';
                this.keyDt = [];
                this.$refs['loader'].stateChanger.reset();
            }, flushDb() {
                this.$confirm('将清空此DB所有数据, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    insFlushDb(this.ins, this.db).then((resp) => {
                        if (resp.data.status === 200 && resp.data.code === "OK") {
                            this.$message({
                                message: "清空数据成功!",
                                type: "success"
                            });
                        } else {
                            this.$message.error({
                                message: "清空数据出错!" + resp.data.message
                            });
                        }
                        this.triggerScan();
                    }).catch((resp) => {
                        this.$message.error({
                            message: "清空数据出错!" + resp.data.message
                        });
                        this.triggerScan();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消清空'
                    });
                })
            }, handlerTableSelect(selects) {
                this.selection = selects;
            }, deleteMultiKeys() {
                if (this.selection.length === 0) {
                    this.$message({
                        message: "请先选中数据",
                        type: 'warning'
                    });
                    return;
                }
                let deletes = [];
                for (let i = 0; i < this.selection.length; i++) {
                    deletes.push(this.selection[i].key);
                }
                let params = {
                    db: this.db,
                    ins_id: this.ins,
                    keyName: 'delete',
                    keys: deletes,
                    type: 'delete'
                };
                this.$confirm('将删除选中数据, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteKeys(params).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                message: "删除成功!" + resp.data.message,
                                type: 'success'
                            });
                            //操作列表删除
                            for (let i = 0; i < this.selection.length; i++) {
                                let index = this.keyDt.indexOf(this.selection[i]);
                                if (index !== -1) {
                                    this.keyDt.splice(index, 1);
                                }
                            }
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
            }, setMultiNx() {
                if (this.selection.length === 0) {
                    this.$message({
                        message: "请先选中数据",
                        type: 'warning'
                    });
                    return;
                }
                let expires = [];
                for (let i = 0; i < this.selection.length; i++) {
                    expires.push(this.selection[i].key);
                }
                const _this = this.$refs.nxForm;
                _this.form = {
                    keys: expires,
                    keyName: "expire",
                    type: "expire",
                    ins_id: this.ins,
                    db: this.db,
                    ttl: -1
                };
                _this.dialog = true;
            }
        }
    }
</script>

<style scoped>
    /deep/ .el-table td, /deep/ .el-table th {
        padding: 5px 0;
    }

    /deep/ .el-divider {
        margin: 12px 0 !important;
    }
</style>
