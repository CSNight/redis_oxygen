<template>
    <el-card class="chart-panel">
        <div slot="header">
            <h5>Command Info</h5>
        </div>
        <el-row style="height: 35vh">
            <el-col style="height: 100%" :span="10">
                <div style="height: 30%;display: flex;align-items: center;width: 100%">
                    <svg-icon style="width: 72px;height: 72px" :icon-class="'console'"/>
                    <div class="dt-reg">
                        <p class="des-title">{{'Command Process: '+command_process}}</p>
                        <p class="des-title">{{'Command OPS: '+ops}}</p>
                        <p class="des-title">{{'PubSub Channels: '+ps_chs}}</p>
                        <p class="des-title">{{'PubSub Patterns: '+ps_pat}}</p>
                    </div>
                </div>
                <div style="height: 70%" id="ringCmdChart"></div>
            </el-col>
            <el-col style="height: 100%" :span="14">
                <el-table :data="command_calls" height="350">
                    <el-table-column prop="cmd" align="center" label="命令"/>
                    <el-table-column prop="calls" align="center" label="执行次数"/>
                    <el-table-column prop="usec" align="center" label="CPU耗时"/>
                    <el-table-column prop="usec_per_call" align="center" label="CPU单位耗时"/>
                </el-table>
            </el-col>
        </el-row>
    </el-card>
</template>

<script>
    export default {
        name: "CommandInfo",
        data() {
            return {
                ringChart: null,
                command_process: 0,
                ops: 0,
                ps_chs: 0,
                ps_pat: 0,
                command_calls: [],
                placeHolderStyle: {
                    normal: {
                        label: {show: false}, labelLine: {show: false},
                        color: 'rgba(0, 0, 0, 0)', borderColor: 'rgba(0, 0, 0, 0)', borderWidth: 0
                    }
                },
                linerRing: new this.$echarts.graphic.LinearGradient(0, 0, 1, 1, [{
                    offset: 0,
                    color: '#7777eb'
                }, {
                    offset: 1,
                    color: '#70ffac'
                }]),
                pieOption: {
                    title: {
                        text: 'Top Five Commands', left: 60,
                        textStyle: {fontSize: 15, fontWeight: 'normal', color: ['#7777eb']}
                    },
                    series: [{
                        name: '',
                        type: 'pie',
                        clockWise: false,
                        center: ['45%', '50%'],
                        radius: [65, 70],
                        hoverAnimation: false,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true, position: 'outside', padding: [5, 0],
                                    color: '#ddd', rich: {white: {color: '#ddd', align: 'center'}}
                                },
                                labelLine: {show: false}
                            }
                        },
                        data: []
                    }]
                }
            }
        }, mounted() {
            this.ringChart = this.$echarts.init(document.getElementById('ringCmdChart'));
            this.ringChart.setOption(this.pieOption);
        }, methods: {
            updateChart(cmd_info) {
                this.command_process = cmd_info.tcs;
                this.ops = cmd_info.ops;
                this.ps_chs = cmd_info.pub_ch;
                this.ps_pat = cmd_info.pub_pat;
                this.command_calls = [];
                let cmd_stat = JSON.parse(cmd_info.cmd_stat);
                for (let cmd in cmd_stat) {
                    let info = cmd_stat[cmd];
                    info.cmd = cmd;
                    this.command_calls.push(info)
                }
                this.command_calls.sort((a, b) => {
                    return parseInt(a.calls) >= parseInt(b.calls) ? -1 : 1
                });
                let dtSize = this.command_calls.length >= 5 ? 5 : this.command_calls.length;
                let data = [];
                let totalFive = 0;
                for (let i = 0; i < dtSize; i++) {
                    totalFive += parseInt(this.command_calls[i].calls);
                }
                for (let i = 0; i < dtSize; i++) {
                    data.push(
                        {
                            value: Number(parseInt(this.command_calls[i].calls) / totalFive * 100).toFixed(),
                            name: this.command_calls[i].cmd,
                            itemStyle: {
                                normal: {
                                    borderWidth: 5,
                                    shadowBlur: 10,
                                    borderColor: this.linerRing,
                                    shadowColor: 'rgba(142, 152, 241, 0.6)'
                                }
                            }
                        }, {
                            value: 4,
                            name: '',
                            itemStyle: this.placeHolderStyle
                        })
                }
                this.pieOption.series[0].data = data;
                this.ringChart.setOption(this.pieOption)
            }, reset() {
                this.command_calls = [];
                this.pieOption.series[0].data = [];
                this.command_process = 0;
                this.ops = 0;
                this.ps_chs = 0;
                this.ps_pat = 0;
            }
        }
    }
</script>

<style lang="scss" scoped>
    /deep/ .el-card__header {
        padding: 5px 15px;
        color: #5e72e4;
        border-color: #2b3553;
        border-left: none !important;

        /deep/ h5 {
            color: #5e72e4;
            padding: 0;
            margin: 0;
        }
    }

    .dt-reg {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        height: 70%;
        margin-left: 20px;
        align-items: center;

        .des-title {
            padding: 0;
            margin: 0;
            width: 100%;
            color: #4BFFFC;
            text-align: left;
            font-size: 0.9em;
        }
    }

    /deep/ .el-card__body {
        padding: 0 10px;
    }

    /deep/ .el-table::before {
        background: transparent;
    }

    /deep/ .el-table {
        background: transparent;


        /deep/ tr, th, td {
            background-color: inherit !important;
            border-bottom: 1px solid #2b3553;
        }

        /deep/ .el-table__header {
            background: transparent;
            color: #956FD4
        }

        /deep/ .el-table__body-wrapper {
            border-bottom: 1px solid #2b3553;
            color: #956FD4
        }
    }
</style>