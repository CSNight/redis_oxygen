<template>
    <el-table :data="rules">
        <el-table-column align="center" label="规则名称" prop="name"/>
        <el-table-column align="center" label="状态" width="80px" prop="enabled">
            <template slot-scope="scope">
                <el-tag :type="scope.row.enabled?'success':'danger'">{{scope.row.enabled?'启用':'禁用'}}</el-tag>
            </template>
        </el-table-column>
        <el-table-column align="center" label="监控指标" width="90px" prop="indicator"/>
        <el-table-column align="center" label="表达式" prop="expression"/>
        <el-table-column align="center" label="通知级别" width="90px" prop="clazz">
            <template slot-scope="scope">
                <el-tag :type="scope.row.clazz">{{scope.row.clazz}}</el-tag>
            </template>
        </el-table-column>
        <el-table-column align="center" label="联系人" prop="contact"/>
        <el-table-column align="center" label="操作" width="120px">
            <template slot-scope="scope">
                <el-button v-if="rights('RULES_UPDATE')" size="mini"
                           :icon="scope.row.enabled?'el-icon-turn-off':'el-icon-open'"
                           :type="scope.row.enabled?'primary':'success'" :title="'启用/禁用'"
                           @click="toggleRule(scope.row)"/>
                <el-button v-if="rights('RULES_DEL')" size="mini" icon="el-icon-delete" type="danger"
                           @click="deleteRule(scope.row)"/>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
    import {deleteRule, getMonitorRuleAll, getMonitorRuleByUser, updateRule} from "@/api/task/monitor_task";

    export default {
        name: "RuleTable",
        data() {
            return {
                rules: [],
            }
        }, mounted() {
            this.$nextTick(() => {
                this.loadRules();
            })
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadRules() {
                if (!this.rights("RULES_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("RULES_QUERY_ALL")) {
                    this.rules = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadAll() {
                this.loading = true;
                getMonitorRuleAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.rules = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        })
                    }
                    this.loading = false;
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
                    this.loading = false;
                });
            }, loadByUser() {
                this.loading = true;
                getMonitorRuleByUser().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.rules = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
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
                    this.loading = false;
                });
            }, toggleRule(row) {
                let state = !row.enabled;
                updateRule(row.id, state).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.loadRules();
                    } else {
                        this.$message.error('修改状态失败!' + resp.data.message);
                    }
                }).catch(() => {
                    this.$message.error('修改状态失败!');
                })
            }, deleteRule(row) {
                this.$confirm('将删除该监控规则是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    deleteRule(row.id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message.error('删除失败!');
                        }
                        this.loadRules();
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