<template>
    <div class="dash">
        <el-row :gutter="20" style="height: 3vh;margin-bottom:20px;position: relative">
            <h3 style="text-align: center;color:#00eaff;left:46%;margin: 0;padding: 0;position: absolute">Redis
                实例监控</h3>
            <div style="display: flex;justify-content: space-between;">
                <el-select v-model="curIns" size="mini" @change="monitorTarget">
                    <el-option v-for="item in instances" :key="item.id" :value="item.id" :label="item.instance_name"/>
                </el-select>
                <el-button-group>
                    <el-button type="primary" size="mini" icon="el-icon-refresh" @click="reset"></el-button>
                </el-button-group>
            </div>
        </el-row>
        <el-row :gutter="20" style="height: 30vh;margin-bottom:20px">
            <el-col :span="8"
                    style="height: 100%;display: flex;justify-content:space-between;align-items:stretch;flex-wrap: wrap">
                <CPU ref="cpuChart"/>
            </el-col>
            <el-col :span="8" style="height: 100%">
                <instance-info ref="ins_info" :ins="curIns"/>
            </el-col>
            <el-col :span="8" style="height: 100%">
                <Memory ref="memChart"/>
            </el-col>
        </el-row>
        <NetworkIO ref="nioChart"/>
        <el-row :gutter="20" style="height: 40vh;margin-bottom:40px">
            <el-col :span="8" style="height: 100%">
                <Clients ref="cliChart"/>
            </el-col>
            <el-col :span="4" style="height: 100%">
                <Keyspace ref="keyChart"/>
            </el-col>
            <el-col :span="12" style="height: 100%">
                <CommandInfo ref="cmdChart"/>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {guid} from "../../utils/utils";
    import {getAll, getByUser} from "../../api/redismanage/redis_ins";
    import InstanceInfo from "@/views/dashboard/sections/InstanceInfo";
    import CPU from "@/views/dashboard/sections/CPU";
    import Memory from "@/views/dashboard/sections/Memory";
    import NetworkIO from "@/views/dashboard/sections/NetworkIO";
    import CommandInfo from "@/views/dashboard/sections/CommandInfo";
    import Clients from "@/views/dashboard/sections/Clients";
    import Keyspace from "@/views/dashboard/sections/Keyspace";

    export default {
        name: 'Dashboard',
        components: {Keyspace, Clients, CommandInfo, NetworkIO, Memory, CPU, InstanceInfo},
        data() {
            return {
                identify: this.$store.getters.identify, appId: guid(), instances: [], curIns: '', targetIns: {}
            }
        }, created() {
            let _this = this;
            this.$nextTick(() => {
                this.$wss.on("stRev", this.msgRev, this.appId);
                this.$wss.on("wsOpen", () => {
                    this.loadIns("false");
                }, this.appId);
                this.$wss.connect(this.identify);

                _this.$parent.$el.style.padding = '85px 0 0 0'
            })
        }, watch: {
            curIns: {
                handler: function (n, o) {
                    if (o) {
                        this.stop(o);
                    }
                    this.start(n);
                }
            }
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadIns(update) {
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll(update);
                } else {
                    this.instances = [];
                    this.loadByUser();
                }
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let ins = resp.data.message;
                        for (let i = 0; i < ins.length; i++) {
                            if (ins[i].role === 'sentinel') {
                                continue;
                            }
                            this.instances.push(ins[i]);
                        }
                        if (this.instances.length > 0) {
                            this.curIns = this.instances[0].id;
                        }
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
                            if (ins[i].role === 'sentinel') {
                                continue;
                            }
                            this.instances.push(ins[i]);
                        }
                        if (this.instances.length > 0) {
                            this.curIns = this.instances[0].id;
                        }
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
            }, monitorTarget() {
                for (let i = 0; i < this.instances.length; i++) {
                    if (this.instances[i].id === this.curIns) {
                        this.targetIns = this.instances[i]
                    }
                }
            },
            msgRev(e) {
                if (e.body.hasOwnProperty('Physical')) {
                    this.$refs.cpuChart.updateChart(e.body.Physical);
                    this.$refs.memChart.updateChart(e.body.Physical);
                    this.$refs.nioChart.updateChart(e.body.Physical);
                    this.$refs.cmdChart.updateChart(e.body.Commands);
                    this.$refs.cliChart.updateChart(e.body.Clients);
                    this.$refs.keyChart.updateChart(e.body.Keyspace);
                }
            }, start(t) {
                if (this.$wss.isConnected) {
                    this.$wss.send("", 100, this.appId, t, 'statistic');
                }
            }, stop(t) {
                this.$wss.send("", 101, this.appId, t, 'statistic');
                this.reset();
            }, reset() {
                this.$refs.cpuChart.reset();
                this.$refs.memChart.reset();
                this.$refs.nioChart.reset();
                this.$refs.cmdChart.reset();
                this.$refs.cliChart.reset();
                this.$refs.keyChart.reset();
            }
        }, beforeDestroy() {
            this.stop();
            this.$wss.un("stRev", this.appId);
            this.$wss.un("wsOpen", this.appId);
            this.$wss.close();
            this.$parent.$el.style.padding = ''
        }
    }
</script>
<style lang="scss" scoped>
    .dash {
        height: 100%;
        width: 100%;
        padding: 10px 20px;
        background: #1e1e2f
    }

    .chart-panel {
        background: rgba(39, 41, 61, 0.4);
        height: 100%;
        border: 0;
        box-shadow: 0 5px 20px 0 rgba(0, 0, 0, .6);
    }

    /deep/ .el-select {

        /deep/ input {
            background: transparent;
            color: #5e72e4;
            border-color: #2b3553;
        }
    }

    /deep/ .el-card__header {
        padding: 5px 15px;
        color: #dddddd;
        border-color: #2b3553;
        border-left: 5px solid #11cdef;

        div {
            display: flex;
            align-items: center;

            i {
                font-weight: 100;
                font-size: 1.17em;
                padding-bottom: 1px;
                margin-right: 5px;
            }
        }

        /deep/ h3 {
            font-weight: 300;
            font-family: Poppins, sans-serif;
            margin: 5px 0;
        }
    }

    .ins-info {
        padding-left: 0;
        list-style: none;

        li {
            border-bottom: 1px solid #2b3553;
            border-top: 1px solid #2b3553;
            padding: 11px 0;
            font-size: 13px;
            color: #6F85EF;

            i {
                text-align: center;
                color: #6F85EF;
            }
        }

        .user-right {
            float: right;

            a {
                color: #317EF3;
                margin-right: 5px;
            }
        }
    }
</style>
