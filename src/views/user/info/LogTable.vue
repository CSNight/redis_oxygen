<template>
    <el-card style="margin-left: 10px;height:100%;">
        <div slot="header" class="">
            <span>操作日志</span>
        </div>
        <el-table
                ref="roleTable"
                :data="logs"
                style="width: 100%;margin-bottom: 20px;font-size: 12px"
                row-key="name"
                v-loading="loading"
                highlight-current-row>
            <el-table-column
                    prop="create_time"
                    align="center"
                    label="创建时间">
                <template slot-scope="scope">
                    <i class="el-icon-time"></i>
                    <span style="margin-left: 10px">{{  dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.ct)) }}</span>
                </template>
            </el-table-column>
            <el-table-column
                    prop="ip"
                    align="center"
                    label="IP">
            </el-table-column>
            <el-table-column
                    prop="mo"
                    align="center"
                    label="模块">
            </el-table-column>
            <el-table-column
                    prop="un"
                    align="center"
                    label="用户">
            </el-table-column>
            <el-table-column
                    prop="op"
                    align="center"
                    label="操作">
            </el-table-column>
            <el-table-column
                    prop="st"
                    align="center"
                    label="状态">
                <template slot-scope="scope">
                    <el-tag :type="getStType(scope.row.st)">{{scope.row.st}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    prop="cost"
                    align="center"
                    label="耗时">
                <template slot-scope="scope">
                    <el-tag :type="getCostType(scope.row.cost)">{{getCostFormat(scope.row.cost)}}</el-tag>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="cur"
                :page-sizes="[5,10,15]"
                :page-size="pg_size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                style="float: right;margin-bottom: 30px">
        </el-pagination>
    </el-card>
</template>

<script>
    import {get_logs} from "../../../api/system/log_api";
    import {dateFormat} from "../../../utils/utils";

    export default {
        name: "LogTable",
        data() {
            return {
                logs: [], loading: false, pg_size: 10, cur: 1, total: 0,
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData();
            })
        }, methods: {
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            },
            getStType(st) {
                if (st <= 300) {
                    return 'primary'

                } else if (st >= 300 && st < 400) {
                    return 'warning'
                } else {
                    return 'error'
                }
            },
            getCostType(cost) {
                if (cost <= 100) {
                    return 'success'

                } else if (cost >= 100 && cost < 500) {
                    return 'primary'
                } else if (cost >= 500 && cost < 1000) {
                    return 'warning'
                } else {
                    return 'error'
                }
            },
            getCostFormat(cost) {
                if (cost < 1000) {
                    return cost + "ms"
                } else {
                    return cost / 1000.0 + "s"
                }
            },
            loadData() {
                get_logs(this.$store.getters.name, this.cur, this.pg_size).then((resp) => {
                    this.logs = resp.data.message.content;
                    this.total = resp.data.message.totalElements;
                })
            }, handleSizeChange: function (size) {
                this.pg_size = size;
                this.loadData();
            },
            handleCurrentChange: function (currentPage) {
                this.cur = currentPage;
                this.loadData();
            },
        }
    }
</script>

<style scoped>

</style>