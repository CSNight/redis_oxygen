<template>
    <div class="console">
        <div class="history">
            <el-input v-for="item in logs"
                      :class="item.type==='ERROR'?'err':'success'"
                      readonly
                      type="textarea"
                      autosize
                      class="area" v-model="item.content"/>
        </div>
        <div class="in-area">
            <div class="prefix">{{prefix}}</div>
            <el-input type="textarea" autosize class="cmdLine" @keydown.native="cmdSend" v-model="cmd">
            </el-input>
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
                appId: guid()
            }
        }, methods: {
            updateHistory(msg) {
                console.log(msg)
            }, generateNode() {

            }, cmdSend(e) {
                if (e.code === 'Enter') {
                    e.preventDefault();
                    if (this.logs.length === 0) {
                        this.logs.push({
                            content: this.prefix + ' ' + this.cmd,
                            type: 'cmd'
                        });
                    } else {
                        let last = this.logs[this.logs.length - 1];
                        if (last.type === 'ERROR') {
                            this.logs.push({
                                content: this.prefix + ' ' + this.cmd,
                                type: 'cmd'
                            });
                        } else {
                            last.content += "\r\n" + this.prefix + ' ' + this.cmd;
                        }
                    }
                    this.$wss.send(this.cmd, 100, this.appId, this.ins);
                    this.cmd = ""
                } else {
                    return e
                }
            }
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
            color: #2fb;
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