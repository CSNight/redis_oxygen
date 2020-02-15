<template>
    <el-card class="chart-panel" style="height: 100%;width: 100%">
        <div slot="header">
            <i class="fa fa-microchip"></i>
            <h3>Memory</h3>
        </div>
        <el-row>
            <el-col :span="14" id="memBar" style="height: 24vh"></el-col>
            <el-col :span="10" id="memRadar" style="height: 24vh"></el-col>
        </el-row>
    </el-card>
</template>

<script>
    export default {
        name: "Memory",
        data() {
            return {
                radarChart: null,
                barChart: null,
                usLiner: new this.$echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: 'rgba(156,107,211,0.5)'},
                        {offset: 0.2, color: 'rgba(156,107,211,0.3)'},
                        {offset: 1, color: 'rgba(156,107,211,0)'}
                    ]),
                rsLiner: new this.$echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: '#956FD4'},
                        {offset: 1, color: '#3EACE5'}
                    ]),
                areaStyle: {
                    normal: {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
                            colorStops: [{offset: 0, color: '#4BFFFC'}, {offset: 0.5, color: 'rgba(0,0,0,0)'},
                                {offset: 1, color: '#4BFFFC'}], globalCoord: false
                        },
                        opacity: 1
                    }
                },
                radarOption: {
                    tooltip: {show: true, trigger: 'item'},
                    radar: {
                        center: ['46%', '50%'], radius: 70,
                        name: {textStyle: {color: '#4BFFFC', fontSize: 14}},
                        indicator: [{text: 'overhead', max: 10}, {text: 'rss', max: 10}, {text: 'peak', max: 10},
                            {text: 'dataset', max: 10}, {text: 'use', max: 10}],
                        splitArea: {show: true, areaStyle: {color: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],}},
                        axisLine: {lineStyle: {color: '#153269'}},
                        splitLine: {lineStyle: {color: '#113865', width: 1,}},
                    },
                    series: [{
                        type: 'radar', symbolSize: 8, data: [{
                            value: [0, 0, 0, 0, 0], name: 'memory',
                            lineStyle: {color: '#4A99FF'}, itemStyle: {
                                normal: {
                                    color: '#4BFFFC', shadowColor: '#4A99FF',
                                    shadowBlur: 10
                                }
                            }, areaStyle: null
                        }]
                    }]
                }, barOption: {
                    grid: {left: '8%', right: '2%', top: '15%', bottom: '5%', containLabel: true},
                    xAxis: {type: 'time', axisLine: {lineStyle: {color: '#397cbc'}}, axisTick: {show: false}},
                    yAxis: [{
                        type: 'value',
                        name: '内存/MB',
                        splitLine: {show: false},
                        axisLine: {lineStyle: {color: '#27b4c2'}}
                    },
                        {
                            type: 'value',
                            name: '碎片率/%',
                            max: 100,
                            min: 0,
                            splitLine: {show: false},
                            axisLine: {lineStyle: {color: '#27b4c2'}}
                        }],
                    series: [
                        {
                            name: '碎片率', type: 'line', smooth: true, showAllSymbol: true, symbol: 'circle',
                            symbolSize: 8, yAxisIndex: 1,
                            itemStyle: {normal: {color: '#4BFFFC'}}, data: []
                        },
                        {
                            name: 'mem_us', type: 'bar', barWidth: 10,
                            itemStyle: {normal: {barBorderRadius: 5, color: null}}, data: []
                        },
                        {
                            name: 'mem_rss', type: 'bar', barGap: '-100%', barWidth: 10,
                            itemStyle: {normal: {barBorderRadius: 5, color: null}}, data: []
                        },
                    ]
                }
            }
        }, mounted() {
            this.radarOption.series[0].data[0].areaStyle = this.areaStyle;
            this.barOption.series[1].itemStyle.normal.color = this.rsLiner;
            this.barOption.series[2].itemStyle.normal.color = this.usLiner;
            this.radarChart = this.$echarts.init(document.getElementById('memRadar'));
            this.barChart = this.$echarts.init(document.getElementById('memBar'));
            this.radarChart.setOption(this.radarOption);
            this.barChart.setOption(this.barOption);
        }, methods: {
            updateChart(phy) {
                let values = [phy.mem_oh, phy.mem_rs, phy.mem_peak, phy.mem_ds, phy.mem_us];
                let maxVal = Math.max(...values);
                this.radarOption.series[0].data[0].value = values;
                let indicators = this.radarOption.radar.indicator;
                for (let i = 0; i < indicators.length; i++) {
                    indicators[i].max = maxVal;
                }
                this.radarChart.setOption(this.radarOption);
                let dtRs = this.barOption.series[2].data;
                let dtUs = this.barOption.series[1].data;
                let dtFr = this.barOption.series[0].data;
                if (dtRs.length > 10) {
                    dtRs.shift();
                    dtUs.shift();
                    dtFr.shift();
                }
                dtRs.push({name: "mrs" + phy.tm, value: [phy.tm, phy.mem_rs / 1024 / 1024]});
                dtUs.push({name: "mus" + phy.tm, value: [phy.tm, phy.mem_us / 1024 / 1024]});
                dtFr.push({name: "mfr" + phy.tm, value: [phy.tm, phy.mem_fr]});
                this.barChart.setOption(this.barOption);
            }, reset() {
                this.barOption.series[0].data = [];
                this.barOption.series[1].data = [];
                this.barOption.series[2].data = [];
                let indicators = this.radarOption.radar.indicator;
                for (let i = 0; i < indicators.length; i++) {
                    indicators[i].max = 0;
                }
                this.radarOption.series[0].data[0].value = [0, 0, 0, 0, 0];
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