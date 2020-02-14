<template>
    <el-card class="chart-panel" style="height: 100%;width: 100%">
        <div slot="header">
            <i class="el-icon-cpu"></i>
            <h3>CPU</h3>
        </div>
        <el-row>
            <el-col :span="8" id="cpuGChart" style="height: 22vh"></el-col>
            <el-col :span="16" id="cpuLChart" style="height: 24vh"></el-col>
        </el-row>
    </el-card>
</template>

<script>
    export default {
        name: "CPU",
        data() {
            return {
                guaChart: null,
                lineChart: null,
                guaLiner: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0,
                    [{offset: 0, color: 'rgba(0,0,0, 0)',}, {offset: 1, color: 'rgba(242,166,200,0.6)',}]),
                lineSuLiner: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0,
                    [{offset: 0, color: 'rgba(7,44,90,0.3)'}, {offset: 1, color: 'rgba(0,212,199,0.9)'}]),
                lineUuLiner: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0,
                    [{offset: 0, color: 'rgba(7,44,90,0.3)'}, {offset: 1, color: 'rgba(0,146,246,0.9)'}]),
                commonHide: {show: 0},
                guaOption: {
                    series: [{
                        type: 'gauge', center: ['50%', '60%'], radius: '85%', // 1行3个
                        splitNumber: 10, min: 0, max: 100, startAngle: 225, endAngle: -45,
                        axisLine: {show: true, lineStyle: {width: 1, color: [[1, 'rgba(0,0,0,0)']]}}, //仪表盘轴线
                        axisTick: {show: true, lineStyle: {color: 'rgba(255,255,255,0.6)', width: 1}, length: -6}, //刻度样式
                        splitLine: {show: true, length: 10, lineStyle: {color: 'rgba(0,212,199,0.6)'}}, //分隔线样式
                        axisLabel: {
                            show: true,
                            distance: 2,
                            textStyle: {color: 'white', fontSize: '12'}
                        },
                        pointer: this.commonHide,
                        detail: this.commonHide
                    }, {
                        name: 'CPU', type: 'gauge', center: ['50%', '60%'], radius: '90%', startAngle: 225,
                        endAngle: -45, min: 0, max: 100, axisLine: {
                            show: true, lineStyle: {
                                width: 50,
                                color: [[0], [1, 'rgba(255,255,255, 0)']]
                            }
                        },
                        axisTick: this.commonHide,
                        splitLine: this.commonHide,
                        axisLabel: this.commonHide,
                        pointer: {show: true, length: '102%', width: 3},
                        title: {
                            show: true, offsetCenter: [0, -20], color: '#67FFFC', fontSize: 14, borderRadius: 21,
                            padding: 5
                        },
                        detail: {
                            show: true, offsetCenter: [0, '50%'], textStyle: {fontSize: 14, color: '#67FFFC'},
                            formatter: '{value}' + '%',
                            rich: {name: {fontSize: 20, lineHeight: 10, color: '#ddd', padding: [30, 0, 0, 0]}}
                        },
                        itemStyle: {normal: {color: '#03b7c9',}},
                        data: [{value: 0, name: 'CPU'}]
                    }]
                },
                lineOption: {
                    grid: {left: '7%', right: '5%', top: '15%', bottom: '5%', containLabel: true},
                    legend: {
                        show: true, icon: 'stack', itemWidth: 10, itemHeight: 10,
                        textStyle: {color: ['#1bb4f6', '#27b4c2', '#aecb56']}, data: ['用户态', '内核态', "使用率"]
                    },
                    xAxis: {
                        type: 'time', splitLine: {show: 0},
                        axisLine: {show: true, lineStyle: {color: '#397cbc'}}
                    },
                    yAxis: [{
                        name: "内核占用",
                        type: 'value', boundaryGap: [0, '100%'], axisLine: {lineStyle: {color: '#27b4c2'}},
                        splitLine: {show: 1, lineStyle: {color: '#172a55'}}
                    }, {
                        name: "使用率", min: 0, max: 100,
                        type: 'value', boundaryGap: [0, '100%'], axisLine: {lineStyle: {color: '#aecb56'}},
                        splitLine: {show: 0}
                    }],
                    series: [{
                        name: '用户态', type: 'line', symbol: 'circle', symbolSize: 6, smooth: true,
                        itemStyle: {
                            normal: {
                                shadowColor: '#4BFFFC', shadowBlur: 10,
                                color: '#0092f6', lineStyle: {color: "#0092f6", width: 1}, areaStyle: {color: null}
                            }
                        },
                        data: []
                    }, {
                        name: '内核态', type: 'line', symbol: 'circle', symbolSize: 6, smooth: true,
                        itemStyle: {
                            normal: {
                                shadowColor: '#4BFFFC', shadowBlur: 10,
                                color: '#00d4c7', lineStyle: {color: "#00d4c7", width: 1}, areaStyle: {color: null}
                            }
                        },
                        data: []
                    }, {
                        name: '使用率', type: 'line', symbol: 'circle', symbolSize: 6, smooth: true,
                        itemStyle: {
                            normal: {
                                shadowColor: '#4BFFFC', shadowBlur: 10,
                                color: '#aecb56', lineStyle: {color: "#aecb56", width: 1}
                            }
                        },
                        data: []
                    }]
                }
            }
        },
        mounted() {
            this.guaOption.series[1].axisLine.lineStyle.color[0].push(this.guaLiner);
            this.lineOption.series[0].itemStyle.normal.areaStyle.color = this.lineUuLiner;
            this.lineOption.series[1].itemStyle.normal.areaStyle.color = this.lineSuLiner;
            this.guaChart = this.$echarts.init(document.getElementById('cpuGChart'));
            this.lineChart = this.$echarts.init(document.getElementById("cpuLChart"));
            this.guaChart.setOption(this.guaOption);
            this.lineChart.setOption(this.lineOption);
        }, methods: {
            updateChart(phy) {
                let cpuPer = Number(phy.cpu_per * 100.0).toFixed(3);
                this.guaOption.series[1].data[0].value = cpuPer;
                this.guaOption.series[1].axisLine.lineStyle.color[0][0] = phy.cpu_per;
                this.guaChart.setOption(this.guaOption);
                let dtUu = this.lineOption.series[0].data;
                let dtSu = this.lineOption.series[1].data;
                let dtCpu = this.lineOption.series[2].data;
                if (dtUu.length > 15) {
                    dtUu.shift();
                    dtSu.shift();
                    dtCpu.shift();
                }
                dtUu.push({name: "csu" + phy.tm, value: [phy.tm, phy.cpu_uu]});
                dtSu.push({name: "csu" + phy.tm, value: [phy.tm, phy.cpu_su]});
                console.log(cpuPer);
                dtCpu.push({name: "cpu" + phy.tm, value: [phy.tm, cpuPer]});
                this.lineChart.setOption(this.lineOption);
            }
        }
    }
</script>

<style scoped>
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

    /deep/ .el-card__body {
        padding: 0 10px;
    }
</style>