<template>
    <div>
        <el-row>
            <el-col :span="6" style="height:auto;">
                <el-input class="filter-item" style="width:70%;height: 30px" v-if="rights('INS_SEARCH')" clearable
                          v-model="query.blurry" size="mini" placeholder="输入名称进行过滤" @change="loadById"/>
            </el-col>
            <el-col :span="18" style="height:auto">
                <div class="head-container">
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
                                <el-button size="mini" :icon="getIcon(data.type)"
                                           :class="'ins '+(data.type==='db'?'dbBtn':'')">{{ node.label }}</el-button>
                                <el-tag v-if="data.type==='db'" style="margin-left: 10px" size="mini"
                                        :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                            </span>
                            <span v-if="data.type==='ins'">
                                <el-tag style="margin-right: 10px" size="mini"
                                        :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                                <el-button :disabled="!data.reachable" type="text" size="mini"
                                           @click="newViewer(data)">清空</el-button>
                                <el-button type="text" size="mini"
                                           @click="loadById(data)">刷新</el-button>
                            </span>
                        </span>
                        </el-tree>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="18" style="height:85vh">
                <div style="height:100%;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1);margin-left: 10px">
                    <el-tabs style="height:100%;padding:10px;"
                             closable v-model="currentTabName" @tab-remove="removeTab" :before-leave="changeTab">
                        <el-tab-pane style="width: 100%;display: block" v-for="item in dbTabs" :key="item.name"
                                     :label="item.title"
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
    import {getAll, getByIns, getByUser} from "../../../api/redismanage/redis_dba";
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
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll();
                } else {
                    this.loading = true;
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
            }, loadAll() {
                getAll().then((resp) => {
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
            }, loadById(ins) {
                this.loading = true;
                getByIns(ins.id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let insNew = resp.data.message;
                        for (let i = 0; i < this.instances.length; i++) {
                            if (this.instances[i].id === insNew.id) {
                                this.$set(this.instances,i,insNew);
                                break;
                            }
                        }
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
