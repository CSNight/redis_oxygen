<template>
    <div ref="log" style="overflow-y:auto;height: 30vh;border: 1px solid #dddddd">
        <el-input ref="inner" v-model="logs" type="textarea" autosize :resize="'none'"/>
    </div>
</template>

<script>
    import {dateFormat} from "@/utils/utils";

    export default {
        name: "ExecLog",
        props: {
            appId: {
                type: String,
                required: true
            },
            jobId: {
                type: String,
                required: true
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.startPipe();
            })
        },
        data() {
            return {
                logs: ''
            }
        }, methods: {
            startPipe() {
                if (this.$wss.isConnected) {
                    this.$wss.send("", 102, this.appId, this.jobId, 'execution');
                }
            }, stopPipe() {
                this.$wss.send("", 103, this.appId, this.jobId, 'execution');
            }, updateLog(res) {
                if (this.logs.length > 3000) {
                    this.logs = '';
                }
                this.logs += dateFormat("YYYY-mm-dd HH:MM:SS", new Date(res.time)) + '--' + res.times + ' result: '
                    + res.response + '\r\n' + "(cost: " + res.cost + "ms)\r\n";
            }
        }, beforeDestroy() {
            this.stopPipe();
        }
    }
</script>

<style scoped>
    >>> .el-textarea__inner {
        border: none;
        color: #888888;
        font-size: 11px;
        overflow: hidden;
    }
</style>