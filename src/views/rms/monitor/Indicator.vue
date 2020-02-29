<template>
    <div>
        <div class="head-container">
            <el-button type="primary" icon="el-icon-plus" size="mini" class="filter-item">新增
            </el-button>
            <el-button type="danger" icon="el-icon-refresh" size="mini"/>
        </div>
        <el-scrollbar style="height: 100%">
            <el-table style="width:100%;margin-bottom:20px;" :data="indicators" v-loading="loading" ref="indicatorList">
                <el-table-column align="center" prop="label" label="指标名称"/>
                <el-table-column align="center" prop="name" label="指标值"/>
                <el-table-column align="center" prop="sign_support" label="支持信号量">

                </el-table-column>
                <el-table-column align="center" prop="exp_support" label="支持表达式">

                </el-table-column>
                <el-table-column align="center" prop="unit" label="指标单位"/>
                <el-table-column align="center" prop="create_time" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {dateFormat} from "@/utils/utils";
    import {getIndicators} from "@/api/redismanage/redis_indicate";

    export default {
        name: "Indicator",
        data() {
            return {
                indicators: []
            }
        }, created() {
            this.$nextTick(() => {
                this.loadIndicators();
            })
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, dateFormat(fmt, dt) {
                if (dt == null) {
                    return '';
                }
                return dateFormat(fmt, new Date(dt));
            }, loadIndicators() {
                if (!this.rights("INDICATOR_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                    return;
                }
                getIndicators().then((resp) => {
                    if (resp.data.code === 200 && resp.data.status === "OK") {
                        this.indicators = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    if (resp.hasOwnProperty("data")) {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.message
                        });
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>