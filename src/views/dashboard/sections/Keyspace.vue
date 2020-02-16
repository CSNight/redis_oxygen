<template>
    <el-card class="chart-panel">
        <div slot="header">
            <h5>Keyspace</h5>
        </div>
        <el-row style="height: 15vh">
            <el-col :span="6"
                    style="text-align: center;display: flex;align-items: center;justify-content: center;height: 100%">
                <svg-icon style="width: 32px;height:32px;" icon-class="keyspace"/>
            </el-col>
            <el-col :span="18">
                <div class="key-title">Total Keys Count:</div>
                <div class="key-val">{{total_keys}}</div>
                <div class="key-title">Keyspace hit:</div>
                <div class="key-val"> {{hit_keys}}</div>
                <div class="key-title">Keyspace miss:</div>
                <div class="key-val">{{miss_keys}}</div>
            </el-col>
        </el-row>
        <el-row style="height: 25vh" id="keyExvChart"></el-row>
    </el-card>
</template>

<script>
    export default {
        name: "Keyspace",
        data() {
            return {
                total_keys: '0',
                hit_keys: '0',
                miss_keys: '0',
                horBarChart: null,
                usLiner: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {offset: 0, color: 'rgba(156,107,211,0.5)'},
                    {offset: 0.2, color: 'rgba(156,107,211,0.3)'},
                    {offset: 1, color: 'rgba(156,107,211,0)'}
                ]),
                rsLiner: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {offset: 0, color: '#956FD4'},
                    {offset: 1, color: '#3EACE5'}
                ]),
                horBarOption: {
                    grid: {left: '7%', right: '9%', top: '25%', bottom: '12%', containLabel: true},
                    xAxis: {
                        type: 'time',
                        axisLine: {lineStyle: {color: '#397cbc'}},
                        axisTick: {show: 1},
                        splitLine: {show: 0}
                    },
                    legend: {
                        show: true,
                        icon: 'stack',
                        itemWidth: 10,
                        itemHeight: 10,
                        textStyle: {color: ['#1bb4f6', '#956FD4', '#4BFFFC', '#aecb56']},
                        data: ['exp', 'evict', "exp/s", "evict/s"]
                    },
                    yAxis: [{
                        type: 'value', name: 'Count', splitLine: {show: 1, lineStyle: {color: '#172a55'}},
                        axisLine: {lineStyle: {color: '#27b4c2'}}
                    }, {
                        type: 'value', name: 'Count/s', splitLine: {show: false},
                        axisLine: {lineStyle: {color: '#27b4c2'}}
                    }],
                    series: [{
                        name: 'exp', type: 'bar', barWidth: 10, stack: 'keyspace',
                        itemStyle: {normal: {barBorderRadius: 5, color: null}}, data: []
                    }, {
                        name: 'evict', type: 'bar', barGap: '-100%', barWidth: 10, stack: 'keyspace',
                        itemStyle: {normal: {barBorderRadius: 5, color: null}}, data: []
                    }, {
                        name: 'exp/s', type: 'line', smooth: true, showAllSymbol: true, symbol: 'circle',
                        symbolSize: 8, yAxisIndex: 1,
                        itemStyle: {normal: {color: '#4BFFFC'}}, data: []
                    }, {
                        name: 'evict/s', type: 'line', smooth: true, showAllSymbol: true, symbol: 'circle',
                        symbolSize: 8, yAxisIndex: 1,
                        itemStyle: {normal: {color: '#aecb56'}}, data: []
                    }]
                }
            }
        },
        mounted() {
            this.horBarOption.series[0].itemStyle.normal.color = this.rsLiner;
            this.horBarOption.series[1].itemStyle.normal.color = this.usLiner;
            this.horBarChart = this.$echarts.init(document.getElementById('keyExvChart'));
            this.horBarChart.setOption(this.horBarOption);
        },
        methods: {
            getUnit(val) {
                if (val < 1000) {
                    return '';
                } else if (val >= 1000 && val < Math.pow(1000, 2)) {
                    return 'K²'
                } else {
                    return 'K³'
                }
            },
            getVal(val) {
                if (val < 1000) {
                    return val;
                } else if (val >= 1000 && val < Math.pow(1000, 2)) {
                    return Number(val / 1000).toFixed(3);
                } else {
                    return Number(val / Math.pow(1000, 2)).toFixed(3);
                }
            },
            updateChart(keys) {
                let dtExp = this.horBarOption.series[0].data;
                let dtEvc = this.horBarOption.series[1].data;
                let dtExps = this.horBarOption.series[2].data;
                let dtEvcs = this.horBarOption.series[3].data;
                if (dtExp.length > 5) {
                    dtExp.shift();
                    dtEvc.shift();
                    dtExps.shift();
                    dtEvcs.shift();
                }
                dtExp.push({name: "exp" + keys.tm, value: [keys.tm, keys.exp_keys]});
                dtEvc.push({name: "evc" + keys.tm, value: [keys.tm, keys.evc_keys]});
                dtExps.push({name: "exps" + keys.tm, value: [keys.tm, keys.exp_kps]});
                dtEvcs.push({name: "evcs" + keys.tm, value: [keys.tm, keys.evc_kps]});
                this.horBarChart.setOption(this.horBarOption);
                this.total_keys = this.getVal(keys.key_size) + this.getUnit(keys.key_size);
                this.hit_keys = this.getVal(keys.ksp_hits) + this.getUnit(keys.ksp_hits);
                this.miss_keys = this.getVal(keys.ksp_miss) + this.getUnit(keys.ksp_miss);
            },
            reset() {
                this.total_keys = '0';
                this.hit_keys = '0';
                this.miss_keys = '0';
                this.horBarOption.series[0].data = [];
                this.horBarOption.series[1].data = [];
                this.horBarOption.series[2].data = [];
                this.horBarOption.series[3].data = [];
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
            color: #aecb56;
            padding: 0;
            margin: 0;
        }
    }

    .key-title {
        font-size: 14px;
        color: #4A99FF;
        margin: 5px 0;
    }

    .key-val {
        font-size: 18px;
        color: #ff8d72
    }

    /deep/ .el-card__body {
        padding: 0 10px;
    }
</style>