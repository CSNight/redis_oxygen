<template>
    <el-row :gutter="20" style="margin-top: 20px" type="flex" :align="'middle'">
        <el-col :span="8">
            <el-card style="height:85vh">
                <div slot="header"><span>监控规则配置</span></div>
                <div style="height:75vh;overflow-y: auto">
                    <el-form ref="form" :model="form" :rules="rules" label-position="left" size="mini"
                             label-width="100px">
                        <el-timeline style="padding: 5px">
                            <el-timeline-item type="danger" timestamp="关联实例" placement="top">
                                <el-form-item label="关联Redis">
                                    <el-select v-model="form.ins_id" style="width: 320px">
                                        <el-option v-for="(item,i) in instances" :key="i" :value="item.id"
                                                   :label="item.instance_name"/>
                                    </el-select>
                                </el-form-item>
                            </el-timeline-item>
                            <el-timeline-item type="danger" timestamp="规则设置" placement="top">
                                <el-form-item label="规则名称">
                                    <el-input v-model="form.rule_name" style="width: 320px"/>
                                </el-form-item>
                                <el-form-item label="规则描述">
                                    <el-input v-model="form.describe" style="width: 320px"/>
                                </el-form-item>
                                <el-form-item label="监控指标">

                                </el-form-item>
                                <el-form-item label="指标周期">
                                    <el-select v-model="form.duration" style="width: 320px">
                                        <el-option v-for="(item,i) in duration" :key="i" :value="item.value"
                                                   :label="item.label"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="持续时长">
                                    <el-select v-model="form.cycle" style="width: 320px">
                                        <el-option v-for="(item,i) in cycle" :key="i" :value="item.value"
                                                   :label="item.label"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="信号量">
                                    <el-select v-model="form.signal" style="width: 320px">
                                        <el-option v-for="(item,i) in signal" :key="i" :value="item.value"
                                                   :label="item.label"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="阈值">
                                    <el-select v-model="form.expression" style="width: 80px">
                                        <el-option v-for="(item,i) in expression" :key="i" :value="item.value"
                                                   :label="item.label"/>
                                    </el-select>
                                    <el-input-number v-model="form.valf" style="width: 120px;margin-left: 5px"/>
                                    <el-input-number v-if="form.expression==='between'" v-model="form.vals"
                                                     style="width: 120px;margin-left: 5px"/>
                                </el-form-item>
                            </el-timeline-item>
                            <el-timeline-item type="danger" timestamp="通知设置" placement="top">
                                <el-form-item label="报警级别">
                                    <el-select v-model="form.level" style="width: 320px">
                                        <el-option v-for="(item,i) in warnLevel" :key="i" :value="item.value"
                                                   :label="item.label"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="通知联系人">
                                    <el-input v-model="form.contact" style="width: 320px"/>
                                </el-form-item>
                                <el-form-item label="邮件主题">
                                    <el-input v-model="form.subject" style="width: 320px"/>
                                </el-form-item>
                            </el-timeline-item>
                        </el-timeline>
                    </el-form>
                </div>
            </el-card>
        </el-col>
        <el-col :span="16">
            <el-card style="height:85vh">
                <div slot="header">监控规则列表</div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import {getAll, getByUser} from "@/api/redismanage/redis_ins";

    export default {
        name: "ReportTask",
        data() {
            return {
                instances: [], form: {
                    ins_id: '',
                    rule_name: '',
                    describe: '',
                    duration: 60,
                    cycle: 1,
                    signal: 'mean',
                    expression: '>=',
                    valf: 0,
                    vals: 0,
                    level: 'info',
                    subject: '',
                    contact: '',
                }, rules: {},
                duration: [
                    {label: "1分钟", value: 60},
                    {label: "5分钟", value: 60 * 5},
                    {label: "15分钟", value: 60 * 15},
                    {label: "30分钟", value: 60 * 15},
                    {label: "1小时", value: 60 * 60}],
                cycle: [
                    {label: "持续1周期", value: 1},
                    {label: "持续3周期", value: 3},
                    {label: "持续5周期", value: 5},
                    {label: "持续10周期", value: 10},
                    {label: "持续15周期", value: 15}],
                signal: [{label: "平均值", value: 'mean'}, {label: "最大值", value: 'max'}, {label: "最小值", value: 'min'}],
                expression: [{label: ">", value: '>'},
                    {label: ">=", value: '>='},
                    {label: "<", value: '<'},
                    {label: "<=", value: '<='},
                    {label: "!=", value: '!='},
                    {label: "=", value: '='}, {label: "区间", value: 'between'}],
                warnLevel: [{label: "通知级 (INFO)", value: 'info'},
                    {label: "警告级 (WARNING)", value: 'warn'},
                    {label: "危险级 (DANGER)", value: 'danger'}]
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData('false');
            })
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadData(update) {
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll(update);
                } else {
                    this.loadByUser();
                }
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadAll(update) {
                getAll(update).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }
        }
    }
</script>

<style scoped>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
</style>