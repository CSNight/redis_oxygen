<template>
    <el-card class="chart-panel">
        <div slot="header">
            <h5>Clients Info</h5>
        </div>
        <el-row style="height: 35vh">
            <el-table :data="redis_clis" height="200">
                <el-table-column prop="id" align="center" label="ID"/>
                <el-table-column prop="addr" width="180" align="center" label="ADDR"/>
                <el-table-column prop="age" align="center" label="AGE/s"/>
                <el-table-column prop="idle" align="center" label="IDLE/s"/>
                <el-table-column prop="db" align="center" label="DBIndex"/>
            </el-table>
            <div style="height: 150px;width: 100%">
                <el-row :gutter="20" style="height:50%;">
                    <el-col :span="12" class="dt-panel">
                        <svg-icon style="width: 32px;height: 32px;margin-left: 15px" icon-class="connection"/>
                        <div class="cli-info">{{total_con+' con received'}}</div>
                    </el-col>
                    <el-col :span="12" class="dt-panel">
                        <svg-icon style="width: 32px;height: 32px;margin-left: 15px" icon-class="con_cli"/>
                        <div class="cli-info">{{con_cli+' alive clients'}}</div>
                    </el-col>
                </el-row>
                <el-row :gutter="20" style="height:50%">
                    <el-col :span="12" class="dt-panel">
                        <svg-icon style="width: 32px;height: 32px;margin-left: 15px" icon-class="disconnect"/>
                        <div class="cli-info">{{rej_con+' con reject'}}</div>
                    </el-col>
                    <el-col :span="12" class="dt-panel">
                        <svg-icon style="width: 32px;height: 32px;margin-left: 15px" icon-class="block_cli"/>
                        <div class="cli-info">{{block_cli+' blocked clients'}}</div>
                    </el-col>
                </el-row>
            </div>
        </el-row>
    </el-card>
</template>

<script>
    export default {
        name: "Clients",
        data() {
            return {
                redis_clis: [],
                con_cli: 0,
                block_cli: 0,
                rej_con: 0,
                total_con: 0
            }
        },
        mounted() {

        }, methods: {
            updateChart(rcs) {
                this.redis_clis = JSON.parse(rcs.cli_info);
                this.con_cli = rcs.cli_con;
                this.block_cli = rcs.cli_blo;
                this.rej_con = rcs.reject_cons;
                this.total_con = rcs.total_cons_rec;
            }, reset() {
                this.redis_clis = [];
                this.con_cli = 0;
                this.block_cli = 0;
                this.rej_con = 0;
                this.total_con = 0;
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
            color: #d4237a;
            padding: 0;
            margin: 0;
        }
    }

    .dt-panel {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .cli-info {
        text-align: left;
        width: 100%;
        font-size: 1em;
        margin-left: 15px;
        color: #11cdef;
        font-family: Consolas,sans-serif;
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