<template>
    <el-row :gutter="10">
        <el-col :span="6">
            <div class="head-container">
                <el-button class="filter-item" size="mini" type="primary" icon="el-icon-refresh"
                           v-if="rights('DBA_QUERY')||rights('DBA_QUERY_ALL')" @click="loadData">刷新实例列表
                </el-button>
            </div>
            <el-card style="height:83vh">
                <div slot="header">
                    <span>实例列表</span>
                </div>
                <div style="height:75vh;overflow-y: auto">
                    <el-tree class="filter-tree" :data="instances" accordion :props="treeProps" ref="tree">
                        <span class="custom-tree-node" slot-scope="{ node,data }">
                            <span>
                                <el-button size="mini" :icon="getIcon(data.node_type)" @click="treeClick(data)"
                                           :class="'ins '+(data.node_type==='db'?'dbBtn':'')">{{ node.label }}</el-button>
                                <el-tag v-if="data.node_type==='db'" style="margin-left: 10px" size="mini"
                                        :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                            </span>
                            <span v-if="data.node_type==='ins'">
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
        <el-col :span="18">
            <key-table v-for="item in dbTabs" :total="item.total" :ref="item.id" :key="item.id" :db="item.db"
                       :ins="item.ins"/>
        </el-col>
    </el-row>
</template>

<script>
    import {getAll, getByIns, getByUser, insFlushAll} from "../../../api/redismanage/redis_dba";
    import KeyTable from "./KeyTable";

    export default {
        name: "DataManager",
        components: {KeyTable},
        data() {
            return {
                instances: [],
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
                if (Object.prototype.hasOwnProperty.call(item,['reachable']) && item.node_type === 'ins') {
                    if (item.reachable) {
                        return 'db:' + item.dbCount
                    } else {
                        return 'unlink'
                    }
                } else if (item.node_type === "db") {
                    return 'keys:' + item.keySize;
                }
            },
            getTagType(item) {
                if (Object.prototype.hasOwnProperty.call(item,['reachable']) && item.node_type === 'ins') {
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
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
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
                if (this.dbTabs.length > 0 && this.dbTabs[0].ins === ins.id) {
                    this.dbTabs.pop();
                }
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
            }, treeClick(e) {
                if (e.node_type === 'db') {
                    this.dbTabs.pop();
                    this.dbTabs.push({
                        id: e.id,
                        total: e.keySize,
                        ins: e.ins,
                        db: Number(e.label.replace("db", ''))
                    });
                }
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
