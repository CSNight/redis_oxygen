<template>
    <el-card class="chart-panel" style="height: 100%;width: 100%">
        <div slot="header">
            <i class="fa fa-microchip"></i>
            <h3>Memory</h3>
        </div>
        <el-row>
            <el-col :span="8" id="cpuGChart" style="height: 22vh"></el-col>
            <el-col :span="16" id="cpuLChart" style="height: 24vh"></el-col>
        </el-row>
    </el-card>
</template>

<script>
    export default {
        name: "Memory",
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