<template>
    <el-row v-if="keyEnt.hasOwnProperty('type')">
        <el-col :span="16">
            <el-divider content-position="center">键值</el-divider>
            <div style="height: 30vh">
                <el-input placeholder="请输入内容" v-model="keyEnt.key" readonly size="mini">
                    <template slot="prepend"><i class="el-icon-key"/>键</template>
                </el-input>
                <el-input type="textarea" v-model="keyEnt.val" class="value-win" resize="none"/>
            </div>
        </el-col>
        <el-col style="margin-left: 10px;height:100%;width:32%">
            <el-divider content-position="center">监控任务</el-divider>
            <el-form :model="taskForm" size="mini" label-width="120px" style="margin-top: 20px">
                <el-form-item label="监控周期(ms)" prop="ttl">
                    <el-input v-model.number="taskForm.interval" style="width: 220px;"/>
                </el-form-item>
                <el-form-item label="延迟(ms)" prop="delay">
                    <el-input v-model.number="taskForm.delay" style="width: 220px;"/>
                </el-form-item>
            </el-form>
            <div style="width: 100%;display: flex;justify-content: center">
                <el-button size="mini" type="primary" @click="stopMonitor">暂停</el-button>
                <el-button size="mini" type="primary" @click="startMonitor">开始</el-button>
            </div>
            <label><textarea v-model="output" readonly class="output"/></label>
        </el-col>
    </el-row>
</template>

<script>
    import {guid} from "../../../utils/utils";

    export default {
        name: "ValueViewer",
        props: {
            db: {
                type: Number,
                required: true
            }, ins: {
                type: String,
                required: true
            }, keyEnt: {
                type: Object,
                required: true
            }
        }, created() {
            this.$nextTick(() => {
                this.$wss.on("dtRev", this.handlerMsg, this.appId);
                this.$wss.connect(this.identify);
            })
        }, data() {
            return {
                appId: guid(),
                identify: this.$store.getters.identify,
                output: '',
                taskForm: {
                    interval: 1000, delay: 0
                }
            }
        }, methods: {
            startMonitor() {
                let params = {
                    keyName: this.keyEnt.key,
                    db: this.db,
                    ins_id: this.ins,
                    type: this.keyEnt.type,
                    ttl: this.keyEnt.ttl,
                    size: this.keyEnt.size,
                    interval: this.taskForm.interval,
                    delay: this.taskForm.delay
                };
                this.$wss.send(JSON.stringify(params), 100, this.appId, this.ins, 'dt_operation');
            },
            stopMonitor() {
                let params = {
                    keyName: this.keyEnt.key,
                    db: this.db,
                    ins_id: this.ins,
                    type: this.keyEnt.type,
                    ttl: this.keyEnt.ttl,
                    size: this.keyEnt.size
                };
                this.$wss.send(JSON.stringify(params), 101, this.appId, this.ins, 'dt_operation');
            },
            handlerMsg(e) {
                switch (e.rmt) {
                    case"KEYWATCH":
                        break;
                    case"KEYWATCHCON":
                        this.output += new Date(e.time).toLocaleString() + ": " + e.body + "\r\n";
                        break;
                    case"DEKEYWATCH":
                        this.output += new Date(e.time).toLocaleString() + ": " + e.body + "\r\n";
                        break;
                }
                console.log(e)
            }
        },
        beforeDestroy() {
            this.stopMonitor();
            this.$wss.un("dtRev", this.appId);
            this.$wss.un("wsClose", this.appId);
            this.$wss.close();
        }
    }
</script>

<style scoped>
    .value-win {
        height: 230px;
        overflow: auto;
        margin-top: 10px;
    }

    /deep/ .el-textarea__inner {
        height: 230px;
    }

    .output {
        resize: none;
        width: 100%;
        height: 100px;
        border: 1px solid #dddddd;
        word-wrap: break-word;
        padding: 5px;
        margin: 5px;
        font-size: 12px
    }
</style>