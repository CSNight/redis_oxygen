<template>
    <el-row :gutter="20" style="height: 15vh;margin-bottom:20px">
        <el-col :span="6" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <svg-icon style="width: 72px;height: 72px" icon-class="network-in"/>
                    <div class="dt-reg">
                        <p class="des-title">Network Total Input</p>
                        <a class="des-value">{{ioit}}</a>
                    </div>
                </div>
                <el-divider></el-divider>
                <div style="margin-top:10px;display: flex;align-items: center">
                    <fa-icon style="color:#9C6BD3;padding: 0" icon-class="fa-heart-rate"/>
                    <a style="color:#9C6BD3;font-size: 14px">{{'Refresh On '+dateFormat("YYYY-mm-dd HH:MM:SS",tm)}}</a>
                </div>
            </el-card>
        </el-col>
        <el-col :span="6" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <svg-icon style="width: 72px;height: 72px" icon-class="network-out"/>
                    <div class="dt-reg">
                        <p class="des-title">Network Total Output</p>
                        <a class="des-value">{{ioot}}</a>
                    </div>
                </div>
                <el-divider></el-divider>
                <div style="margin-top:10px;display: flex;align-items: center">
                    <fa-icon style="color:#9C6BD3;padding: 0" icon-class="fa-atom"/>
                    <a style="color:#9C6BD3;font-size: 14px">
                        {{'Update in every '+interval+' second'}}
                    </a>
                </div>
            </el-card>
        </el-col>
        <el-col :span="6" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <svg-icon style="width: 72px;height: 72px" icon-class="net-in-kps"/>
                    <div class="dt-reg">
                        <p class="des-title">Network Input KBps</p>
                        <a class="des-value">{{ioik+'KB/s'}}</a>
                    </div>
                </div>
                <el-divider></el-divider>
                <div style="margin-top:10px;display: flex;align-items: center">
                    <fa-icon style="color:#9C6BD3;padding: 0" icon-class="fa-battle-net"/>
                    <a style="color:#9C6BD3;font-size: 14px">Redis Instantaneous Input KBps</a>
                </div>
            </el-card>
        </el-col>
        <el-col :span="6" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <svg-icon style="width: 72px;height: 72px" icon-class="net-out-kps"/>
                    <div class="dt-reg">
                        <p class="des-title">Network Output KBps</p>
                        <a class="des-value">{{iook+'KB/s'}}</a>
                    </div>
                </div>
                <el-divider></el-divider>
                <div style="margin-top:10px;display: flex;align-items: center">
                    <fa-icon style="color:#9C6BD3;padding: 0" icon-class="fa-biohazard"/>
                    <a style="color:#9C6BD3;font-size: 14px">Redis Instantaneous Output KBps</a>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import {dateFormat} from "@/utils/utils";

    export default {
        name: "NetworkIO",
        data() {
            return {
                ioit: '0B',
                ioot: '0B',
                ioik: 0,
                iook: 0,
                tm: 0,
                tmLast: 0,
                interval: 0
            }
        }, methods: {
            dateFormat(fmt, dt) {
                if (dt === 0) {
                    return '';
                } else {
                    return dateFormat(fmt, new Date(dt));
                }
            },
            getUnit(val) {
                if (val < 1024) {
                    return 'B';
                } else if (val >= 1024 && val < 1024 * 1024) {
                    return 'KB'
                } else if (val >= 1024 * 1024 && val < Math.pow(1024, 3)) {
                    return 'MB'
                } else if (val >= Math.pow(1024, 3) && val < Math.pow(1024, 4)) {
                    return 'GB'
                }
            },
            getVal(val) {
                if (val < 1024) {
                    return val;
                } else if (val >= 1024 && val < 1024 * 1024) {
                    return Number(val / 1024).toFixed(3);
                } else if (val >= 1024 * 1024 && val < Math.pow(1024, 3)) {
                    return Number(val / Math.pow(1024, 2)).toFixed(3);
                } else if (val >= Math.pow(1024, 3) && val < Math.pow(1024, 4)) {
                    return Number(val / Math.pow(1024, 3)).toFixed(3);
                }
            },
            updateChart(phy) {
                this.ioit = this.getVal(phy.ioi) + this.getUnit(phy.ioi);
                this.ioot = this.getVal(phy.ioo) + this.getUnit(phy.ioo);
                this.ioik = phy.io_iik;
                this.iook = phy.io_iok;
                this.tmLast = this.tm;
                this.tm = phy.tm;
                if (this.tm === 0 || this.tmLast === 0) {
                    this.interval = 0;
                } else {
                    this.interval = Number((this.tm - this.tmLast) / 1000).toFixed();
                }
            }, reset() {
                this.ioit = '0B';
                this.ioot = '0B';
                this.ioik = 0;
                this.iook = 0;
                this.tm = null;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .chart-panel {
        background: rgba(39, 41, 61, 0.4);
        height: 100%;
        border: 0;
        box-shadow: 0 5px 20px 0 rgba(0, 0, 0, .6);
    }

    /deep/ .el-divider {
        background: #2b3553;
        margin: 0;
    }

    /deep/ .el-card__body {
        padding: 0 20px;
    }

    /deep/ .el-card__header {
        padding: 5px 15px;
        display: flex;
        align-items: center;
        height: 105px;
        color: #dddddd;

        border: none !important;

        div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            position: relative;

            .dt-reg {
                top: -10px;
                position: absolute;
                height: 100%;
                right: 10px;
                flex-wrap: wrap;

                .des-title {
                    padding: 0;
                    margin: 0;
                    width: 100%;
                    color: #397cbc;
                    text-align: right;
                    font-size: 0.9em;
                }

                .des-value {
                    width: 100%;
                    text-align: right;
                    font-size: 1.5em;
                    color: #4BFFFC;
                }
            }

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
</style>