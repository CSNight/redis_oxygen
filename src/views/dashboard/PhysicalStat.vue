<template>
    <el-row :gutter="20" style="height: 35vh;margin-bottom:20px;margin-top: 10px">
        <el-col :span="8" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <i class="el-icon-cpu"></i>
                    <h3>CPU</h3>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <i class="fa fa-microchip"></i>
                    <h3>Memory</h3>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8" style="height: 100%">
            <el-card class="chart-panel">
                <div slot="header">
                    <i class="fa fa-network-wired"></i>
                    <h3>Network I/O</h3>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: "PhysicalStat"
    }
</script>

<style lang="scss" scoped>
    .chart-panel {
        background: rgba(39, 41, 61, 0.4);
        height: 100%;
        border: 0;
        box-shadow: 0 5px 20px 0 rgba(0, 0, 0, .6);
    }

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
</style>