<template>
    <div>
        <el-row>
            <el-col :span="6" style="height:auto;">
                <el-button class="filter-item" size="mini" type="danger" icon="el-icon-refresh"
                           v-if="rights('DBA_QUERY')||rights('DBA_QUERY_ALL')" @click="loadData">刷新实例列表
                </el-button>
            </el-col>
            <el-col :span="18" style="height:auto">
                <div class="head-container" v-if="dbTabs.length!==0">
                    <el-input v-if="rights('KEYS_KEY_SCAN')" clearable v-model="match" placeholder="输入菜单名称搜索"
                              style="width: 200px;" size="mini"
                              class="filter-item"/>
                    <el-button class="filter-item" size="mini" type="success" icon="el-icon-refresh"
                               v-if="rights('KEYS_KEY_SCAN')" @click="triggerScan">搜索
                    </el-button>
                    <el-button class="filter-item" size="mini" type="danger" icon="el-icon-delete"
                               v-if="rights('DBA_FLUSH_DB')" @click="flushDb">清空当前数据库
                    </el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="6">
                <el-card style="height:85vh">
                    <div slot="header">
                        <span>实例列表</span>
                    </div>
                    <div style="height:75vh;overflow-y: auto">
                        <el-tree class="filter-tree" :data="instances" accordion :props="treeProps" ref="tree">
                        <span class="custom-tree-node" slot-scope="{ node,data }">
                            <span>
                                <el-button size="mini" :icon="getIcon(data.type)" @click="treeClick(data)"
                                           :class="'ins '+(data.type==='db'?'dbBtn':'')">{{ node.label }}</el-button>
                                <el-tag v-if="data.type==='db'" style="margin-left: 10px" size="mini"
                                        :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                            </span>
                            <span v-if="data.type==='ins'">
                                <el-tag style="margin-right: 10px" size="mini" :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                                <el-button v-if="rights('DBA_FLUSH_ALL')" :disabled="!data.reachable" type="text"
                                           size="mini" @click="flushAll(data)">清空</el-button>
                                <el-button type="text" size="mini" v-if="rights('DBA_QUERY_SINGLE')"
                                           @click="loadById(data)">刷新</el-button>
                            </span>
                        </span>
                        </el-tree>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="18" style="height:85vh">
                <key-table v-for="item in dbTabs" :total="item.total" :ref="item.id" :key="item.id" :db="item.db"
                           :match="match" :ins="item.ins"/>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {getAll, getByIns, getByUser, insFlushAll, insFlushDb} from "../../../api/redismanage/redis_dba";
    import KeyTable from "./KeyTable";

    export default {
        name: "DataManager",
        components: {KeyTable},
        data() {
            return {
                instances: [], match: '',
                identify: this.$store.getters.identify,
                treeProps: {label: 'label', children: 'children'},
                dbTabs: [],
                currentTabName: "",
                tabIndex: 0,
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            })
        }, methods: {
            btnState(ins) {
                return !ins.state;
            },
            getIcon(type) {
                switch (type) {
                    case"ins":
                        return "fac fa fa-codepen";
                    case"db":
                        return "fac fa fa-database";
                }
            },
            getTagText(item) {
                if (item.hasOwnProperty('reachable') && item.type === 'ins') {
                    if (item.reachable) {
                        return 'db:' + item.dbCount
                    } else {
                        return 'disconnect'
                    }
                } else if (item.type === "db") {
                    return 'keys:' + item.keySize;
                }
            },
            getTagType(item) {
                if (item.hasOwnProperty('reachable') && item.type === 'ins') {
                    if (item.reachable) {
                        return 'success'
                    } else {
                        return 'danger'
                    }
                } else {
                    return 'primary'
                }
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadData() {
                if (!this.rights("DBA_QUERY_ALL") && !this.rights("DBA_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("DBA_QUERY_ALL")) {
                    this.instances = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
                this.dbTabs.pop();
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadAll() {
                getAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadById(ins) {
                this.dbTabs.pop();
                getByIns(ins.id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let insNew = resp.data.message;
                        for (let i = 0; i < this.instances.length; i++) {
                            if (this.instances[i].id === insNew.id) {
                                this.$set(this.instances, i, insNew);
                                break;
                            }
                        }
                    } else {
                        this.$message.error({
                            message: "刷新出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "刷新出错!" + resp.data.message
                    });
                })
            }, flushAll(ins) {
                this.$confirm('将清空此实例所有数据, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    insFlushAll(ins.id).then((resp) => {
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
                        this.loadById(ins);
                    }).catch((resp) => {
                        this.$message.error({
                            message: "清空数据出错!" + resp.data.message
                        });
                        this.loadById(ins);
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消清空'
                    });
                })
            }, flushDb() {
                this.$confirm('将清空此DB所有数据, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    insFlushDb(this.dbTabs[0].ins, this.dbTabs[0].db).then((resp) => {
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
            }, treeClick(e) {
                if (e.type === 'db') {
                    this.dbTabs.pop();
                    this.dbTabs.push({
                        id: e.id,
                        total: e.keySize,
                        ins: e.ins,
                        db: Number(e.label.replace("db", ''))
                    });
                }
            }, triggerScan() {
                this.$refs[this.dbTabs[0].id][0].keyDt = [];
                this.$refs[this.dbTabs[0].id][0].$refs['loader'].stateChanger.reset();
            }
        }
    }
</script>

<style lang="scss" scoped>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;

        /deep/ .ins {
            background: transparent;
            border: none;
            height: 25px;
            max-width: 170px;
            padding-left: 0;
            overflow: hidden;
        }

        /deep/ .dbBtn {
            width: 60px;
            padding-right: 22px;
        }

        /deep/ .fac {
            margin-right: 5px;
        }
    }

</style>
