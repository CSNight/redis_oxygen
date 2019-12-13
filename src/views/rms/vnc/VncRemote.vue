<template>
    <div>
        <el-row>
            <el-col :span="4" style="height:auto;">
                <el-input
                        class="filter-item"
                        style="width:70%;height: 30px"
                        size="mini"
                        placeholder="输入名称进行过滤">
                </el-input>
            </el-col>
            <el-col :span="20" style="height:auto">
                <div class="head-container">
                    <el-button class="filter-item" size="mini" type="success"
                               icon="el-icon-search">搜索
                    </el-button>
                    <!-- 新增 -->
                    <div style="display: inline-block;margin: 0 2px;">
                        <el-button class="filter-item" size="mini"
                                   type="primary"
                                   icon="el-icon-plus">新增
                        </el-button>
                        <el-button type="danger" icon="el-icon-refresh" size="mini"
                        />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="5">
                <el-card style="height:85vh">
                    <div slot="header">
                        <span>实例列表</span>
                    </div>
                    <el-tree class="filter-tree" :data="instances" default-expand-all :props="{label: 'instance_name'}"
                             ref="tree">
                        <span class="custom-tree-node" slot-scope="{ node,data }">
                            <span>{{ node.label }}</span>
                            <span>
                                <el-button type="text" size="mini" @click="newConsole(data)">新建</el-button>
                                <el-button type="text" size="mini" @click="closeAll(data)">全部关闭</el-button>
                            </span>
                        </span>
                    </el-tree>
                </el-card>
            </el-col>
            <el-col :span="19" style="height:85vh">
                <div style="height:100%;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1);margin-left: 10px">
                    <el-tabs style="height:100%;padding:10px;"
                             closable
                             v-model="editableTabsValue"
                             @tab-remove="removeTab"
                             :before-leave="changeTab">
                        <el-tab-pane style="width: 100%;background-color: #1f2d3d;color:#2fb"
                                     v-for="item in editableTabs"
                                     :key="item.name"
                                     :label="item.title"
                                     :name="item.name">
                            <cmd-console :ref="item.id" :ins="item.id" :tab-name="item.name" :prefix="item.prefix"/>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {getAll, getByUser} from "../../../api/redismanage/redis_ins";
    import CmdConsole from "./CmdConsole";

    export default {
        name: "VncRemote",
        components: {CmdConsole},
        data() {
            return {
                loading: false, instances: [], editableTabs: [], editableTabsValue: "", tabIndex: 0,
                identify: this.$store.getters.identify,
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData('false');
                this.$wss.connect(this.identify);
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
            }, newConsole(ins) {
                this.addTab(ins)
            }, closeAll() {

            }, addTab(ins) {
                let newTabName = ++this.tabIndex + '';
                let tab = {
                    id: ins.id,
                    title: ins.instance_name + "(" + newTabName + ")",
                    name: ins.instance_name + newTabName,
                    prefix: ins.ip + ":" + ins.port + ">"
                };
                this.editableTabs.push(tab);
                this.editableTabsValue = tab.name;
            }, removeTab(targetName) {
                let tabs = this.editableTabs;
                let activeName = this.editableTabsValue;
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
                this.editableTabsValue = activeName;
                this.editableTabs = tabs.filter(tab => tab.name !== targetName);
                if (this.editableTabs.length === 0) {
                    this.tabIndex = 0;
                }
            }, changeTab(next, old) {
                // eslint-disable-next-line no-console
                console.log(old, next);
                return true;
            }
        }, beforeDestroy() {
            this.$wss.close()
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