<template>
    <div ref="console" class="console">
        <div class="history">
            <el-input v-for="(item,index) in logs" :key="index" :class="getNodeClass(item.type)" readonly
                      type="textarea" autosize class="area" v-model="item.content"/>
        </div>
        <div ref="inputArea" class="in-area">
            <div class="prefix">{{prefix}}</div>
            <el-input type="textarea" autosize class="cmdLine" @keydown.native="cmdSend" v-model="cmd"/>
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
                let content = '';
                if (msg.rmt === "RESP") {
                    content = this.bodyToNode(msg.body, 0);
                    if (msg.hasOwnProperty("cost")) {
                        content += "(" + msg.cost + "ms)"
                    }
                    this.generateNode(content, msg.rmt);
                } else if (msg.rmt === "ERROR") {
                    content = this.bodyToNode(msg.body, 0);
                    this.generateNode(content, msg.rmt)
                }
            }, bodyToNode(body, deep) {
                let content = '';
                if (body instanceof Array) {
                    for (let i = 0; i < body.length; i++) {
                        let item = body[i];
                        if (item instanceof Array) {
                            content += (i + 1) + ') ' + this.bodyToNode(item, deep + 1) + "\r\n";
                        } else {
                            if (i === 0 && deep > 0) {
                                content += (i + 1) + ') ' + item + "\r\n";
                            } else if (deep === 0) {
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
            }, cmdSend(e) {
                if (e.code === 'Enter') {
                    e.preventDefault();
                    if (this.logs.length === 0) {
                        this.logs.push({
                            content: this.prefix + ' ' + this.cmd,
                            type: 'CMD'
                        });
                    } else {
                        let last = this.logs[this.logs.length - 1];
                        if (last.type === 'ERROR') {
                            this.logs.push({
                                content: this.prefix + ' ' + this.cmd,
                                type: 'CMD'
                            });
                        } else {
                            last.content += "\r\n" + this.prefix + ' ' + this.cmd;
                        }
                    }
                    this.$wss.send(this.cmd, 100, this.appId, this.ins);
                    if (this.cmd !== '') {
                        this.cmdHis.push(this.cmd);
                    }
                    this.cmdHisIndex = this.cmdHis.length - 1;
                    this.cmd = ""
                } else if (e.code === "ArrowUp") {
                    if (this.cmdHis.length > 0 && this.cmdHisIndex >= 0) {
                        this.cmd = this.cmdHis[this.cmdHisIndex--];
                    } else {
                        this.cmd = '';
                        this.cmdHisIndex = this.cmdHis.length - 1;
                    }
                } else if (e.code === 'ArrowDown') {
                    if (this.cmdHisIndex < this.cmdHis.length) {
                        this.cmd = this.cmdHis[this.cmdHisIndex++];
                    } else {
                        this.cmd = '';
                        this.cmdHisIndex = 0;
                    }
                } else {
                    return e
                }
            }, getNodeClass(t) {
                switch (t) {
                    // case"CMD":
                    //     return 'cmd';
                    case"ERROR":
                        return 'err';
                    default:
                    case"RESP":
                        return "success";
                }
            }
        }, beforeDestroy() {
            this.$wss.un("msgRev", this.appId)
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