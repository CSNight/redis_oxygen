<template>
    <div>
        <el-row>
            <el-col :span="5" style="height:auto;">
                <el-input class="filter-item" style="width:70%;height: 30px" v-if="rights('INS_SEARCH')" clearable
                          v-model="query.blurry" size="mini" placeholder="输入名称进行过滤" @change="loadQuery"/>
            </el-col>
            <el-col :span="19" style="height:auto">
                <div class="head-container">
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="5">
                <el-card style="height:85vh">
                    <div slot="header">
                        <span>实例列表</span>
                    </div>
                    <el-tree class="filter-tree" :data="instances" default-expand-all
                             :props="{label: 'instance_name',children:'children'}"
                             ref="tree">
                        <span class="custom-tree-node" slot-scope="{ node,data }">
                            <span>
                                <el-button size="mini" :icon="data.icon"
                                           style="border: none;height:25px">{{ node.label }}</el-button>
                            </span>
                        </span>
                    </el-tree>
                </el-card>
            </el-col>
            <el-col :span="19" style="height:85vh">
                <div style="height:100%;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1);margin-left: 10px">
                    <el-tabs style="height:100%;padding:10px;"
                             closable v-model="currentTabName" @tab-remove="removeTab" :before-leave="changeTab">
                        <el-tab-pane style="width: 100%;" v-for="item in dbTabs" :key="item.name" :label="item.title"
                                     :name="item.name">
                            <data-viewer :ref="item.name" :ins="item.id" :tab-name="item.name" :prefix="item.prefix"/>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {getAll, getByUser, queryBy} from "../../../api/redismanage/redis_ins";
    import DataViewer from "../../../views/rms/dtmanage/DataViewer";

    export default {
        name: "DataManager",
        components: {DataViewer},
        data() {
            return {
                query: {blurry: ''},
                loading: false,
                instances: [],
                identify: this.$store.getters.identify,
                dbTabs: [],
                currentTabName: "",
                tabIndex: 0,
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData('false');
            })
        }, methods: {
            btnState(ins) {
                return !ins.state;
            },
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
                        let ins = resp.data.message;
                        for (let i = 0; i < ins.length; i++) {
                            let children = [];
                            for (let j = 0; j < 16; j++) {
                                children.push({
                                    id: i + "," + j,
                                    instance_name: "db" + j,
                                    icon: "fa fa-key",
                                    children: []
                                })
                            }
                            ins[i].children = children;
                            ins[i].icon = "fa fa-database"
                        }
                        this.instances = ins;
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
            }, newViewer(ins) {
                this.addTab(ins)
            }, addTab(ins) {
                let newTabName = ++this.tabIndex + '';
                let tab = {
                    id: ins.id,
                    title: ins.instance_name + "(" + newTabName + ")",
                    name: ins.instance_name + newTabName,
                    prefix: ins.ip + ":" + ins.port + ">"
                };
                this.dbTabs.push(tab);
                this.currentTabName = tab.name;
            }, removeTab(targetName) {
                let tabs = this.dbTabs;
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
                this.dbTabs = tabs.filter(tab => tab.name !== targetName);
                if (this.dbTabs.length === 0) {
                    this.tabIndex = 0;
                }
                delete this.$refs[targetName]
            }, changeTab(next, old) {
                // eslint-disable-next-line no-console
                console.log(old, next);
                return true;
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
</style>
