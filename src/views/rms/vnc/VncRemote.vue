<template>
    <div>
        <el-row>
            <el-col :span="5" style="height:auto;">
                <el-input class="filter-item" style="width:70%;height: 30px" size="mini" placeholder="输入名称进行过滤"/>
            </el-col>
            <el-col :span="19" style="height:auto">
                <div class="head-container">
                    <el-button class="filter-item" size="mini" type="primary" icon="el-icon-refresh-left"
                               @click="clearScreen">清屏
                    </el-button>
                    <!-- 新增 -->
                    <div style="display: inline-block;margin: 0 2px;">
                        <el-button class="filter-item" size="mini" type="danger" icon="el-icon-switch-button"
                                   @click="closeWss">断开
                        </el-button>
                        <el-button type="success" icon="el-icon-refresh" size="mini" @click="refresh()">重连</el-button>
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
                                <el-button type="text" :disabled="btnState(data)" size="mini"
                                           @click="newConsole(data)">新建</el-button>
                                <el-button type="text" :disabled="!data.state" size="mini"
                                           @click="closeAll(data)">全部关闭</el-button>
                            </span>
                        </span>
                    </el-tree>
                </el-card>
            </el-col>
            <el-col :span="19" style="height:85vh">
                <div style="height:100%;box-shadow:0 2px 12px 0 rgba(0, 0, 0, 0.1);margin-left: 10px">
                    <el-tabs style="height:100%;padding:10px;"
                             closable v-model="currentTabName" @tab-remove="removeTab" :before-leave="changeTab">
                        <el-tab-pane style="width: 100%;background-color:#1f2d3d;color:#2fb"
                                     v-for="item in consoleTabs" :key="item.name" :label="item.title"
                                     :name="item.name">
                            <cmd-console :ref="item.name" :ins="item.id" :tab-name="item.name" :prefix="item.prefix"/>
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
    import {guid} from "../../../utils/utils";

    export default {
        name: "VncRemote",
        components: {CmdConsole},
        data() {
            return {
                loading: false, instances: [], consoleTabs: [], currentTabName: "", tabIndex: 0,
                identify: this.$store.getters.identify, appId: guid()
            }
        },
        created() {
            this.$nextTick(() => {
                let _this = this;
                this.loadData('false');
                this.$wss.on("wsOpen", () => {
                    _this.changeTabState(_this.$wss.isConnected);
                }, this.appId);
                this.$wss.on("wsClose", () => {
                    _this.changeTabState(_this.$wss.isConnected);
                }, this.appId);
                this.$wss.connect(this.identify);
            })
        }, methods: {
            btnState(ins) {
                return !ins.state || !this.$wss.isConnected;
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
            }, refresh() {
                this.loadData('true');
                if (!this.$wss.isConnected) {
                    this.$wss.connect(this.identify)
                }
            }, newConsole(ins) {
                this.addTab(ins)
            }, closeAll(ins) {
                let removes = [];
                for (let i = 0; i < this.consoleTabs.length; i++) {
                    if (this.consoleTabs[i].id === ins.id) {
                        removes.push(this.consoleTabs[i].name)
                    }
                }
                for (let i = 0; i < removes.length; i++) {
                    this.removeTab(removes[i]);
                }
            }, addTab(ins) {
                let newTabName = ++this.tabIndex + '';
                let tab = {
                    id: ins.id,
                    title: ins.instance_name + "(" + newTabName + ")",
                    name: ins.instance_name + newTabName,
                    prefix: ins.ip + ":" + ins.port + ">"
                };
                this.consoleTabs.push(tab);
                this.currentTabName = tab.name;
            }, removeTab(targetName) {
                let tabs = this.consoleTabs;
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
                this.consoleTabs = tabs.filter(tab => tab.name !== targetName);
                if (this.consoleTabs.length === 0) {
                    this.tabIndex = 0;
                }
                delete this.$refs[targetName]
            }, changeTab(next, old) {
                // eslint-disable-next-line no-console
                console.log(old, next);
                return true;
            }, changeTabState(state) {
                for (let x in this.$refs) {
                    if (x !== 'tree') {
                        this.$refs[x][0].enable = state;
                    }
                }
                this.loadData('false');
            }, closeWss() {
                this.$wss.close();
            }, clearScreen() {
                this.$refs[this.currentTabName][0].clearHis();
            }
        }, beforeDestroy() {
            this.$wss.un("wsOpen", this.appId);
            this.$wss.un("wsClose", this.appId);
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