<template>
    <div>
        <quota-form ref="form"/>
        <div class="head-container">
            <el-button v-if="rights('INDICATOR_ADD')" type="primary" icon="el-icon-plus" size="mini" class="filter-item"
                       @click="addQuota">新增
            </el-button>
            <el-button v-if="rights('INDICATOR_QUERY')" type="danger" icon="el-icon-refresh" size="mini"
                       @click="loadIndicators"/>
        </div>
        <el-scrollbar style="height: 100%">
            <el-table style="width:100%;margin-bottom:20px;" :data="indicators" v-loading="loading" ref="indicatorList">
                <el-table-column align="center" prop="label" label="指标名称"/>
                <el-table-column align="center" prop="name" label="指标值"/>
                <el-table-column align="center" prop="sign_support" label="支持信号量"/>
                <el-table-column align="center" prop="exp_support" label="支持表达式"/>
                <el-table-column align="center" prop="unit" label="指标单位"/>
                <el-table-column align="center" prop="create_time" label="创建时间">
                    <template slot-scope="scope">
                        {{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time))}}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="create_time" label="操作">
                    <template slot-scope="scope">
                        <el-button v-if="rights('INDICATOR_UPDATE')" type="primary" icon="el-icon-edit" size="mini"
                                   @click="updateQuota(scope.row)"/>
                        <el-button v-if="rights('INDICATOR_DELETE')" type="danger" icon="el-icon-delete" size="mini"
                                   @click="deleteQuota(scope.row)"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {dateFormat} from "@/utils/utils";
    import {deleteIndicator, getIndicators} from "@/api/redismanage/redis_indicate";
    import QuotaForm from "@/views/rms/monitor/QuotaForm";

    export default {
        name: "Indicator",
        components: {QuotaForm},
        data() {
            return {
                indicators: [], loading: false
            }
        }, created() {
            this.$nextTick(() => {
                this.loadIndicators();
            })
        }, methods: {
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
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
                this.loading = true;
                getIndicators().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.indicators = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    if (Object.prototype.hasOwnProperty.call(resp,["data"])) {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.message
                        });
                    }
                })
            }, addQuota() {
                this.$refs.form.dialog = true;
                this.$refs.form.isAdd = true;
            }, updateQuota(row) {
                this.$refs.form.form = {
                    id: row.id,
                    name: row.name,
                    label: row.label,
                    exp: row.exp_support.split(";"),
                    signal: row.sign_support.split(";"),
                    unit: row.unit
                };
                this.$refs.form.dialog = true;
                this.$refs.form.isAdd = false;
            }, deleteQuota(row) {
                this.$confirm('将删除该监控指标是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteIndicator(row.id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message.error('删除失败!');
                        }
                        this.loadIndicators();
                    }).catch(() => {
                        this.$message.error('删除失败!');
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            }
        }
    }
</script>

<style scoped>

</style>