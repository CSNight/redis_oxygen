<template>
    <el-card class="chart-panel ins-table">
        <div slot="header">
            <i class="fa fa-codepen"></i>
            <h3>Instance</h3>
        </div>
        <el-table :data="ins" height="300" :show-header="false">
            <el-table-column prop="instance_name" align="center" label="名称"/>
            <el-table-column prop="state" align="center" label="状态">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="scope.row.state ? 'success' : 'danger'">
                        {{scope.row.state?'在线':'断开'}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" size="mini">监控</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<script>
    export default {
        name: "InstanceStatus",
        props: {
            ins: {
                type: Array,
                required: true,
                defaultValue: []
            }
        }
    }
</script>

<style lang="scss" scoped>
    .ins-table {
        /deep/ .el-card__body {
            padding: 0 10px;
        }
    }

    /deep/ .el-tag {
        background: transparent;
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