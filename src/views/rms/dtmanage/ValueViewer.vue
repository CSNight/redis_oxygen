<template>
    <el-row v-if="keyEnt.hasOwnProperty('type')">
        <el-col :span="16">
            <el-divider content-position="center">键值</el-divider>
            <div style="height: 30vh">
                <el-input placeholder="请输入内容" v-model="keyEnt.key" readonly size="mini">
                    <template slot="prepend"><i class="el-icon-key"/>键</template>
                </el-input>
                <el-input v-if="keyEnt.type==='string'" type="textarea" v-model="kv" class="value-win"
                          resize="none"/>
                <div style="width: 100%;overflow-y: auto;height: 230px" v-if="format.hasOwnProperty(keyEnt.type)">
                    <table v-if="keyEnt.type!== 'stream'" class="value-win">
                        <tr style="font-weight: bold;font-size:14px;border-top:1px solid #dddddd">
                            <td v-for="(k ,i) in format[keyEnt.type]" :key="i">{{k}}</td>
                        </tr>
                        <tr v-for="(item,index) in kv" :key="index">
                            <td>{{index+1}}</td>
                            <td v-if="keyEnt.type==='zset'">{{item.score}}</td>
                            <td v-if="keyEnt.type==='zset'">{{item.element}}</td>
                            <td v-if="keyEnt.type==='set'||keyEnt.type==='list'">{{item}}</td>
                            <td v-if="keyEnt.type==='hash'">{{item}}</td>
                            <td v-if="keyEnt.type==='hash'">{{kv[item]}}</td>
                        </tr>
                    </table>
                    <el-row v-if="keyEnt.type==='stream'" class="value-win" style="border-top:1px solid #dddddd;">
                        <el-row class="s-row">
                            <el-col :span="8" class="s-col" style="height: 25px;font-weight: bold">ID</el-col>
                            <el-col :span="8" class="s-col" style="height: 25px;font-weight: bold">Field</el-col>
                            <el-col :span="8" class="s-col" style="height: 25px;font-weight: bold">Sequence</el-col>
                        </el-row>
                        <el-row class="s-row" v-for="(item,index) in kv" :key="index">
                            <el-col class="s-col" :span="8">{{item.id.sequence+'-'+item.id.time}}</el-col>
                            <el-col class="s-col" :span="8">
                                <div v-for="(ik,j) in Object.keys(item.fields)" :key="j">{{ik}}</div>
                            </el-col>
                            <el-col class="s-col" :span="8">
                                <div v-for="(ik,j) in Object.keys(item.fields)" :key="j">{{item.fields[ik]}}</div>
                            </el-col>
                        </el-row>
                    </el-row>
                </div>
            </div>
        </el-col>
        <el-col style="margin-left: 10px;height:100%;width:32%">
            <el-divider content-position="center">监控任务</el-divider>
            <el-form :model="taskForm" size="mini" label-width="120px" style="margin-top: 20px">
                <el-form-item label="监控周期(ms)" prop="ttl">
                    <el-input :readonly="isMonitor" v-model.number="taskForm.interval" style="width: 220px;"/>
                </el-form-item>
                <el-form-item label="延迟(ms)" prop="delay">
                    <el-input :readonly="isMonitor" v-model.number="taskForm.delay" style="width: 220px;"/>
                </el-form-item>
            </el-form>
            <div style="width: 100%;display: flex;justify-content: center">
                <el-button size="mini" :disabled="!isMonitor" type="primary" @click="stopMonitor">暂停</el-button>
                <el-button size="mini" :disabled="isMonitor" type="primary" @click="startMonitor">开始</el-button>
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
        }, watch: {
            keyEnt: {
                handler: function f(e) {
                    this.kv = e.val;
                    return e;
                }
            }
        }, created() {
            this.$nextTick(() => {
                if (this.keyEnt && this.keyEnt.val) {
                    this.kv = this.keyEnt.val
                }
                this.$wss.on("dtRev", this.handlerMsg, this.appId);
                this.$wss.connect(this.identify);
            })
        }, data() {
            return {
                appId: guid(),
                identify: this.$store.getters.identify,
                output: '',
                kv: null,
                format: {
                    list: ['ID', 'Element'],
                    set: ['ID', 'Element'],
                    zset: ['ID', 'Score', 'Element'],
                    hash: ['Field', 'Value'],
                    stream: ['Sequence', 'Time', 'Field', 'Value']
                },
                taskForm: {
                    interval: 1000, delay: 0
                }, isMonitor: false,
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
                        this.kv = e.body[this.keyEnt.key];
                        this.output += new Date(e.time).toLocaleString() + ": Receive Data Refresh for Key " + this.keyEnt.key + "\r\n";
                        break;
                    case"KEYWATCHCON":
                        this.output += new Date(e.time).toLocaleString() + ": " + e.body + " for Key " + this.keyEnt.key + "\r\n";
                        this.isMonitor = true;
                        break;
                    case"DEKEYWATCH":
                        this.output += new Date(e.time).toLocaleString() + ": " + e.body + " for Key " + this.keyEnt.key + "\r\n";
                        this.isMonitor = false;
                        break;
                }
                console.log(e)
            }
        },
        beforeDestroy() {
            this.stopMonitor();
            this.$wss.un("dtRev", this.appId);
            this.$wss.close();
        }
    }
</script>

<style lang="scss" scoped>
    .value-win {
        overflow: auto;
        margin-top: 10px;
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        font-size: 14px;

        tr {
            width: 100%;
            font-size: 13px;
            color: #5a5e66;
            text-align: center;
            height: 30px;
            border-bottom: 1px solid #dddddd;

            td {
                width: auto;
            }
        }

        .s-row {
            font-size: 13px;
            color: #5a5e66;
            text-align: center;
            border-bottom: 1px solid #dddddd;

            .s-col {
                margin-top: 5px;
                align-items: center;
                font-size: 13px;
                color: #5a5e66;
                text-align: center;
                height: auto;

                div {
                    height: 20px;
                }
            }
        }
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
