<template>
    <div style="height: 100%;width:100%;padding: 10px">
        <el-row :gutter="20" style="height: 35vh;margin-bottom:20px;margin-top: 10px">
            <el-col :span="8" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
            <el-col :span="8" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
            <el-col :span="8" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20" style="height: 15vh;margin-bottom:20px">
            <el-col :span="6" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
            <el-col :span="6" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
            <el-col :span="6" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
            <el-col :span="6" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20" style="height: 40vh;margin-bottom:40px">
            <el-col :span="12" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
            <el-col :span="12" style="height: 100%">
                <el-card class="chart-panel"></el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: 'Dashboard',
        data() {
            return {
                msg: "hello"
            }
        }
    }
</script>
<style scoped>
    .chart-panel {
        background: #27293d;
        height: 100%;
        border: 0;
        box-shadow: 0 1px 20px 0 rgba(0, 0, 0, .6);
        border-radius: .2857rem;
    }
</style>
