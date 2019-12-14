<template>
    <div ref="console" class="console">
        <div class="history">
            <el-input v-for="(item,index) in logs" :key="index" :class="getNodeClass(item.type)" readonly
                      type="textarea" autosize class="area" v-model="item.content"/>
        </div>
        <div ref="inputArea" class="in-area">
            <div v-if="inputShow" class="prefix">{{prefix}}</div>
            <el-input type="textarea" autosize class="cmdLine" @keydown.native="cmdProcess" v-model="cmd"/>
        </div>
    </div>
</template>

<script>
    import {guid} from "../../../utils/utils";

    export default {
        name: "CmdConsole",
        props: {
            prefix: {
                type: String,
                require: true,
            }, ins: {
                type: String,
                require: true,
            }, tabName: {
                type: String,
                require: true,
            }
        }, created() {
            this.$nextTick(() => {
                this.$wss.on("msgRev", this.updateHistory, this.appId);
            })
        }, data() {
            return {
                cmd: '',
                inputShow: true,
                inComing: false,
                logs: [],
                cmdHis: [],
                cmdHisIndex: 0,
                appId: guid()
            }
        }, watch: {
            cmdHis: function (val) {
                if (val.length > 10) {
                    val = val.splice(0, 1);
                    this.cmdHisIndex = val.length - 1;
                }
            },
            logs: function (val) {
                if (val.length > 1000) {
                    val.splice(0, 1);
                }
            }
        }, methods: {
            updateHistory(msg) {
                if (msg.appId !== this.appId) {
                    return;
                }
                let content = '';
                if (msg.rmt === "RESP" || msg.rmt === 'PUBSUB') {
                    content = this.bodyToNode(msg.body, 0);
                    if (msg.hasOwnProperty("cost")) {
                        content += "(" + msg.cost + "ms)"
                    }
                    this.generateNode(content, msg.rmt);
                } else if (msg.rmt === "ERROR") {
                    content = this.bodyToNode(msg.body, 0);
                    this.generateNode(content, msg.rmt)
                } else if (msg.rmt === "DESUB") {
                    content = this.bodyToNode(msg.body, 0);
                    this.generateNode(content, msg.rmt);
                    //当收到DESUB消息时 输出区显示，取消console流接收状态
                    this.inputShow = true;
                    this.inComing = false;
                }
            }, bodyToNode(body, deep) {
                let content = '';
                if (body instanceof Array) {
                    for (let i = 0; i < body.length; i++) {
                        let item = body[i];
                        if (item instanceof Array) {
                            content += (i + 1) + ') ' + this.bodyToNode(item, deep + 1) + "\r\n";
                        } else {
                            //消息体大于一层嵌套时，第二层起 第一行序号前不需要空格
                            if (i === 0 && deep > 0) {
                                content += (i + 1) + ') ' + item + "\r\n";
                            } else if (deep === 0) {
                                //第一层消息体第一行，序号前不需要空格
                                content += (i + 1) + ') ' + item + "\r\n";
                            } else {
                                content += new Array(deep + 3).fill(' ').join("") + (i + 1) + ') ' + item + "\r\n";
                            }
                        }
                    }
                } else if (body instanceof Object) {
                    content += body;
                } else {
                    content += body;
                }
                return content;
            }, generateNode(content, type) {
                if (this.logs.length === 0) {
                    this.logs.push({
                        content: content,
                        type: type
                    });
                } else {
                    let last = this.logs[this.logs.length - 1];
                    if (last.type === 'ERROR' || type === "ERROR") {
                        this.logs.push({
                            content: content,
                            type: type
                        });
                    } else {
                        last.content += "\r\n" + content;
                    }
                }
                setTimeout(() => {
                    this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
                }, 500);
            }, cmdProcess(e) {
                if (!this.inputShow && this.inComing) {
                    e.preventDefault();
                }
                if (e.code === 'Enter') {
                    e.preventDefault();
                    let logType = "CMD";
                    //处理sub
                    if (['SUBSCRIBE', 'PSUBSCRIBE'].indexOf(this.cmd.toUpperCase().split(' ')[0]) !== -1) {
                        this.startStream();
                        logType = 'SUB';
                    } else if (this.cmd.toUpperCase().startsWith("MONITOR")) {
                        this.$message({
                            message: "不支持的命令",
                            type: 'warning',
                            duration: 3 * 1000
                        })
                    } else {
                        this.$wss.send(this.cmd, 100, this.appId, this.ins);
                    }
                    this.cmdToHis(logType);
                    //保存命令记录
                    if (this.cmd !== '') {
                        this.cmdHis.push(this.cmd);
                    }
                    //设置命令历史滚动索引
                    this.cmdHisIndex = this.cmdHis.length - 1;
                    //清空输出区
                    this.cmd = ""
                } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                    this.cmdRoll(e.code)
                } else if (e.code === 'KeyC' && e.ctrlKey && this.inComing) {
                    this.stopStream()
                } else {
                    return e
                }
            }, cmdToHis(logType) {
                //命令记录添加到历史区 无记录时直接添加，有记录时先判断最新的历史区块类型，同类型切不是错误区块则直接追加，否则新建区块
                if (this.logs.length === 0) {
                    this.logs.push({
                        content: this.prefix + ' ' + this.cmd,
                        type: logType
                    });
                } else {
                    let last = this.logs[this.logs.length - 1];
                    if (last.type === 'ERROR' || logType === 'SUB' || last.type === 'SUB') {
                        this.logs.push({
                            content: this.prefix + ' ' + this.cmd,
                            type: logType
                        });
                    } else {
                        last.content += "\r\n" + this.prefix + ' ' + this.cmd;
                    }
                }
            }, cmdRoll(code) {
                if (code === "ArrowUp") {
                    if (this.cmdHis.length > 0 && this.cmdHisIndex >= 0) {
                        this.cmd = this.cmdHis[this.cmdHisIndex--];
                    } else {
                        this.cmd = '';
                        this.cmdHisIndex = this.cmdHis.length - 1;
                    }
                } else if (code === 'ArrowDown') {
                    if (this.cmdHisIndex < this.cmdHis.length) {
                        this.cmd = this.cmdHis[this.cmdHisIndex++];
                    } else {
                        this.cmd = '';
                        this.cmdHisIndex = 0;
                    }
                }
            }, startStream() {
                //判断sub类型，设定指令类型
                let cmdPart = this.cmd.split(" ");
                let cmdType = 0;
                if (cmdPart[0].toUpperCase() === 'SUBSCRIBE') {
                    cmdType = 200;
                } else if (cmdPart[0].toUpperCase() === 'PSUBSCRIBE') {
                    cmdType = 201;
                }
                if (cmdType === 0) {
                    return;
                }
                this.$wss.send(this.cmd, cmdType, this.appId, this.ins);
                //输出区隐藏，设置console为流接收
                this.inputShow = false;
                this.inComing = true;
            }, stopStream() {
                //查询最新历史命令，判断历史sub命令，设定指令类型
                let cmdPart = this.cmdHis[this.cmdHis.length - 1].split(" ");
                let cmdType = 0;
                if (cmdPart[0].toUpperCase() === 'SUBSCRIBE') {
                    cmdType = 202;
                } else if (cmdPart[0].toUpperCase() === 'PSUBSCRIBE') {
                    cmdType = 203;
                }
                if (cmdType === 0) {
                    return;
                }
                //获取命令参数，既channels或patterns
                let subChannels = cmdPart.slice(1);
                let params = subChannels.join(" ");
                this.$wss.send(params, cmdType, this.appId, this.ins);

            }, getNodeClass(t) {
                switch (t) {
                    case"SUB":
                        return 'sub';
                    case"ERROR":
                        return 'err';
                    default:
                    case"RESP":
                        return "success";
                }
            }
        }, beforeDestroy() {
            this.logs = [];
            if (!this.inputShow && this.inComing) {
                this.stopStream();
            }
            this.inputShow = true;
            this.inComing = false;
            this.$wss.un("msgRev", this.appId);
        }
    }
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar {
        overflow-x: hidden;
    }

    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
    }

    .console {
        width: 100%;
        margin: 0;
        padding: 10px;
        border: none;
        position: relative;
        height: calc(80vh - 20px);
        font-size: 0.8em;
        overflow: auto;

        .err {
            /deep/ .el-textarea__inner {
                color: #f55 !important;
            }
        }

        .cmd {
            /deep/ .el-textarea__inner {
                color: #fa2 !important;
            }
        }

        .sub {
            /deep/ .el-textarea__inner {
                color: #f2f !important;
            }
        }

        .success {
            /deep/ .el-textarea__inner {
                color: #2fb !important;
            }
        }

        .in-area {
            width: 100%;
        }

        .history {
            width: 100%;
            height: auto;
            background: transparent;
            word-break: break-all;
            font-size: 0.8em;
            -webkit-appearance: none;
            border: none;


            .area {
                width: 100%;
                font-size: 1em;

                /deep/ textarea {
                    padding-left: 0 !important;
                    line-height: 2;
                    font-size: 0.8em;
                }

                /deep/ textarea:focus textarea:hover textarea:read-only {
                    border: none;
                }

                /deep/ textarea ::-webkit-scrollbar {
                    overflow-x: hidden;
                }

                /deep/ textarea::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                /deep/ textarea::-webkit-scrollbar-thumb {
                    background-color: #ddd;
                    border-radius: 3px;
                }
            }

        }

        .prefix {
            background: transparent;
            border: none;
            color: #fa2 !important;
            width: auto;
            display: inline;
            float: left;
            line-height: 30px;
        }

        .cmdLine {
            width: 120vh;
            border: none;
            word-break: break-all;
            display: inline-block;
            float: left;
            margin-right: 0;
        }

        /deep/ textarea {
            font-size: 0.8em;
            resize: none;
            background: transparent;
            color: #fff;
            border: none;
            padding-left: 5px !important;
        }

        /deep/ textarea:focus {
            border: none;
        }

        /deep/ textarea ::-webkit-scrollbar {
            overflow-x: hidden;
        }

        /deep/ textarea::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        /deep/ textarea::-webkit-scrollbar-thumb {
            background-color: #ddd;
            border-radius: 3px;
        }

        .cmdLine:focus {
            border: none;
            background: transparent;
        }
    }
</style>