<template>
    <el-row>
        <el-col :span="5">
            <el-input class="filter-item" style="width:70%;height: 30px" v-if="rights('INS_SEARCH')" clearable
                      v-model="query.blurry" size="mini" placeholder="输入名称进行过滤" @change="loadQuery"/>
            <el-card style="height:83vh">
                <div slot="header">
                    <span>实例列表</span>
                </div>
                <el-tree class="filter-tree" :data="instances" default-expand-all :props="{label: 'instance_name'}"
                         ref="tree">
                    <span class="custom-tree-node" slot-scope="{ node,data }">
                        <span>{{ node.label }}</span>
                        <span>
                            <el-button type="text" :disabled="data.role==='sentinel'" size="mini"
                                       @click="getConfigs(data.id)">配置</el-button>
                            <el-button type="text" size="mini">信息</el-button>
                        </span>
                    </span>
                </el-tree>
            </el-card>
        </el-col>
        <el-col :span="19" style="height:83vh;padding-left: 10px">
            <div class="head-container">
            </div>
            <el-card style="height: 83vh;overflow-y: auto">
                <el-collapse v-model="panes" accordion>
                    <el-collapse-item title="Redis信息" name="1">
                        <template slot="title">
                            Redis信息
                            <el-switch style="margin-left: 20px;" v-model="autoRefresh" active-text="自动刷新"
                                       inactive-text="停止刷新" @click.stop.native/>
                        </template>
                        <el-table :show-header="false">
                            <el-table-column align="center" type="selection" width="55"/>
                            <el-table-column prop="id" width="80" align="center" label="id"/>
                        </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="Redis配置" name="2">
                        <el-table :data="configs" :show-header="false" size="mini" style="height:65vh;overflow-y: auto">
                            <el-table-column align="right" prop="confKey" width="220px"/>
                            <el-table-column align="center" prop="confVal">
                                <template slot-scope="scope">
                                    <el-input size="mini" v-model="scope.row.confVal"/>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" prop="confVal" width="120px">
                                <template slot-scope="scope">
                                    <el-button
                                            v-if="rights('RMS_CONF_SAVE')"
                                            type="primary"
                                            @click="saveConfig(scope.row)"
                                            icon="fa fa-save"
                                            size="mini">
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-collapse-item>
                </el-collapse>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import {getAll, getByUser, queryBy} from "../../../api/redismanage/redis_ins";
    import {getConfigs, saveConfig} from "../../../api/redismanage/redis_conf";

    export default {
        name: "RedisConfig",
        data() {
            return {
                loading: false, instances: [], query: {blurry: ''}, configs: [], infos: [],
                identify: this.$store.getters.identify, autoRefresh: false, curIns: '', panes: ''
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData('false');
            })
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadData(update) {
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll(update);
                } else {
                    this.loadByUser();
                }
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadAll(update) {
                getAll(update).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadQuery() {
                this.loading = true;
                if (this.query.blurry === '') {
                    this.loadData('true');
                    return;
                }
                this.instances = [];
                queryBy(this.query).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            }, getConfigs(ins_id) {
                this.configs = [];
                getConfigs(ins_id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let config = resp.data.message;
                        for (let k in config) {
                            this.configs.push({
                                confKey: k,
                                confVal: config[k]
                            })
                        }
                        this.panes = '2';
                        this.curIns = ins_id;
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
            }, saveConfig(row) {
                let params = JSON.parse(JSON.stringify(row));
                params.ins_id = this.curIns;
                saveConfig(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            message: "保存成功!",
                            type: 'success'
                        });
                    } else {
                        this.$message.error({
                            message: "保存出错!" + resp.data.message
                        });
                    }
                }).catch(() => {
                    this.$message.error({
                        message: "保存出错!"
                    });
                })
            }
        }
    }
</script>

<style scoped>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }

    .el-table:before {
        height: 0 !important;
    }
</style>
