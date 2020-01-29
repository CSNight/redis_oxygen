<template>
    <div style="height: 100%;width:100%;padding: 10px">
        <physical-stat/>
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
    import PhysicalStat from "./PhysicalStat";
    import {guid} from "../../utils/utils";

    export default {
        name: 'Dashboard',
        components: {PhysicalStat},
        data() {
            return {
                identify: this.$store.getters.identify, appId: guid()
            }
        }, created() {
            this.$nextTick(() => {
                this.$wss.connect(this.identify);
            })
        }, beforeDestroy() {
            this.$wss.close()
        }
    }
</script>
<style lang="scss" scoped>
    .chart-panel {
        background: #27293d;
        height: 100%;
        border: 0;
        box-shadow: 0 10px 20px 0 rgba(0, 0, 0, .6);
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
