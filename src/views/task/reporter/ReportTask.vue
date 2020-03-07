<template>
    <el-row :gutter="20" style="margin-top: 20px" type="flex" :align="'middle'">
        <el-col :span="6">
            <el-card style="height:85vh;overflow-y: auto">
                <div slot="header"><span>监控规则配置</span></div>
                <el-form ref="form" :model="form" :rules="rules" label-position="right" size="mini" label-width="110px">
                    <el-timeline style="padding: 5px">
                        <el-timeline-item type="danger" timestamp="关联统计任务 (需设置统计任务并启动)" placement="top">
                            <el-form-item label="关联统计任务" prop="job_id">
                                <el-select v-model="form.job_id" style="width: 200px">
                                    <el-option v-for="(t,i) in stJobs" :key="i" :value="t.job_name"
                                               :label="t.instance.instance_name"/>
                                </el-select>
                            </el-form-item>
                        </el-timeline-item>
                        <el-timeline-item type="danger" timestamp="规则设置" placement="top">
                            <el-form-item label="规则名称" prop="rule_name">
                                <el-input v-model="form.rule_name" style="width: 200px"/>
                            </el-form-item>
                            <el-form-item label="规则描述">
                                <el-input v-model="form.describe" style="width: 200px"/>
                            </el-form-item>
                            <el-form-item label="监控指标" prop="indicator">
                                <el-select v-model="form.indicator" style="width: 200px" @change="indicateChange">
                                    <el-option v-for="(t,i) in indicators" :key="i" :value="t.name" :label="t.label"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="指标周期" prop="duration">
                                <el-select v-model="form.duration" style="width: 200px">
                                    <el-option v-for="(t,i) in duration" :key="i" :value="t.value" :label="t.label"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="持续时长" prop="cycle">
                                <el-select v-model="form.cycle" style="width: 200px">
                                    <el-option v-for="(t,i) in cycle" :key="i" :value="t.value" :label="t.label"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="信号量" prop="sign">
                                <el-select v-model="form.sign" style="width: 200px">
                                    <el-option v-for="(t,i) in signal" :key="i" :value="t.value" :label="t.label"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="阈值" prop="expression">
                                <el-select v-model="form.expression" style="width: 200px">
                                    <el-option v-for="(t,i) in expression" :key="i" :value="t.value" :label="t.label"/>
                                </el-select>
                                <el-input-number v-model="form.valf" style="width:100px;margin-top: 5px"
                                                 controls-position="right"/>
                                <el-input-number v-if="form.expression==='between'" v-model="form.vals"
                                                 controls-position="right"
                                                 style="width:100px;margin-top: 5px;margin-left: 5px"/>
                            </el-form-item>
                        </el-timeline-item>
                        <el-timeline-item type="danger" timestamp="通知设置" placement="top">
                            <el-form-item label="报警级别" prop="clazz">
                                <el-select v-model="form.clazz" style="width: 200px">
                                    <el-option v-for="(t,i) in warnLevel" :key="i" :value="t.value" :label="t.label"/>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="通知联系人" prop="contact">
                                <el-input v-model="form.contact" style="width: 200px"/>
                            </el-form-item>
                            <el-form-item label="邮件主题" prop="subject">
                                <el-input v-model="form.subject" style="width: 200px"/>
                            </el-form-item>
                            <el-form-item label="重复告警延迟">
                                <el-select v-model="form.delay" style="width: 200px">
                                    <el-option v-for="(t,i) in delays" :key="i" :value="t.value" :label="t.label"/>
                                </el-select>
                            </el-form-item>
                        </el-timeline-item>
                    </el-timeline>
                </el-form>
                <el-button type="primary" :loading="loading" style="float:right" size="mini" @click="addRule">新建规则
                </el-button>
            </el-card>
        </el-col>
        <el-col :span="18">
            <el-card style="height:85vh">
                <div slot="header">监控规则列表</div>
                <rule-table ref="rules"/>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import {getStJobAll, getStJobByUser} from "@/api/task/stat_task";
    import {getIndicators} from "@/api/redismanage/redis_indicate";
    import RuleTable from "@/views/task/reporter/RuleTable";
    import {addRule} from "@/api/task/monitor_task";

    export default {
        name: "ReportTask",
        components: {RuleTable},
        data() {
            return {
                stJobs: [],
                form: {
                    job_id: '', rule_name: '', describe: '', duration: 60, cycle: 1, indicator: '', sign: '',
                    expression: '', valf: 0, vals: 0, clazz: 'info', subject: '', contact: '', delay: -1
                }, rules: {
                    job_id: [{required: true, message: '请选择关联统计任务', trigger: 'change'}],
                    rule_name: [{required: true, message: '请输入监控规则名称', trigger: 'change'}],
                    duration: [{required: true, message: '请选择监控周期', trigger: 'change'}],
                    cycle: [{required: true, message: '请选择监控持续时长', trigger: 'change'}],
                    indicator: [{required: true, message: '请选择监控指标', trigger: 'change'}],
                    sign: [{required: true, message: '请选择监控信号量', trigger: 'change'}],
                    expression: [{required: true, message: '请选择监控表达式', trigger: 'change'}],
                    clazz: [{required: true, message: '请选择报警级别', trigger: 'change'}],
                    contact: [{required: true, trigger: 'blur', validator: this.validateEmail}],
                    subject: [{required: true, message: '请输入邮件主题', trigger: 'blur'}],
                },
                duration: [{label: "1分钟", value: 60}, {label: "5分钟", value: 60 * 5}, {label: "15分钟", value: 60 * 15},
                    {label: "30分钟", value: 60 * 30}, {label: "1小时", value: 60 * 60}],
                cycle: [{label: "持续1周期", value: 1}, {label: "持续3周期", value: 3}, {label: "持续5周期", value: 5},
                    {label: "持续10周期", value: 10}, {label: "持续15周期", value: 15}],
                delays: [{label: "无延迟", value: -1}, {label: "5分钟", value: 60 * 5}, {label: "15分钟", value: 60 * 15},
                    {label: "30分钟", value: 60 * 15}, {label: "1小时", value: 60 * 60},
                    {label: "12小时", value: 60 * 60 * 12}, {label: "24小时", value: 60 * 60 * 24}],
                warnLevel: [{label: "通知级 (INFO)", value: 'info'}, {label: "警告级 (WARNING)", value: 'warning'},
                    {label: "危险级 (DANGER)", value: 'danger'}],
                signalLabel: {'max': '最大值', 'min': '最小值', 'mean': '平均值'},
                indicators: [], signal: [], expression: [], loading: false, curIndicator: null,
                reg: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
            }
        }, created() {
            this.$nextTick(() => {
                this.loadStJobs();
            })
        }, methods: {
            validateEmail(rule, value, callback) {
                if (value === '') {
                    callback(new Error('请正确填写邮箱'));
                } else {
                    if (value !== '') {
                        if (!this.reg.test(value)) {
                            callback(new Error('请输入有效的邮箱'));
                        }
                    }
                    callback();
                }
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadStJobs() {
                if (!this.rights("STTASK_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("STTASK_QUERY_ALL")) {
                    this.stJobs = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
                this.loadIndicators();
            }, loadAll() {
                this.loading = true;
                getStJobAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.stJobs = resp.data.message;
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
                getStJobByUser().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.stJobs = resp.data.message;
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
            }, loadIndicators() {
                if (!this.rights("INDICATOR_QUERY")) {
                    this.$message.error({
                        message: "禁止查询监控指标!"
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
            }, indicateChange() {
                for (let i = 0; i < this.indicators.length; i++) {
                    if (this.indicators[i].name === this.form.indicator) {
                        let signals = this.indicators[i].sign_support.split(";");
                        let expressions = this.indicators[i].exp_support.split(";");
                        this.curIndicator = this.indicators[i];
                        this.signal = [];
                        this.expression = [];
                        for (let j = 0; j < signals.length; j++) {
                            this.signal.push({label: this.signalLabel[signals[j]], value: signals[j]})
                        }
                        for (let h = 0; h < expressions.length; h++) {
                            this.expression.push({label: expressions[h], value: expressions[h]})
                        }
                    }
                }
            }, addRule() {
                this.$refs['form'].validate((valid) => {
                    if (valid && this.checkExpression(this.curIndicator.unit)) {
                        let expression = '';
                        if (this.form.expression === 'between') {
                            expression = this.form.valf + "|" + this.form.expression + "|" + this.form.vals
                        } else {
                            expression = this.form.expression + "|" + this.form.valf;
                        }
                        let params = {
                            job_id: this.form.job_id,
                            name: this.form.rule_name,
                            description: this.form.describe,
                            indicator: this.form.indicator,
                            delay: this.form.delay,
                            sign: this.form.sign,
                            expression: [this.form.indicator, this.form.duration, this.form.cycle, this.form.sign, expression, this.curIndicator.unit].join("|"),
                            clazz: this.form.clazz,
                            subject: this.form.subject,
                            contact: this.form.contact
                        };
                        addRule(params).then((resp) => {
                            if (resp.data.status === 200 && resp.data.code === "OK") {
                                this.$message({
                                    type: 'success',
                                    message: '添加成功!'
                                });
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: resp.data.message
                                });
                            }
                            this.loading = false;
                            this.$refs.rules.loadRules();
                            this.dialog = false;
                        }).catch((resp) => {
                            this.loading = false;
                            this.dialog = false;
                            if (resp.hasOwnProperty("data")) {
                                this.$message.error({
                                    message: "添加出错!" + resp.data.message
                                });
                            } else {
                                this.$message.error({
                                    message: "添加出错!" + resp.message
                                });
                            }
                        })
                    }
                })
            }, checkExpression(unit) {
                if (this.form.expression === 'between') {
                    if (this.checkNumber(this.form.valf, unit) && this.checkNumber(this.form.vals, unit)) {
                        if (this.form.valf < this.form.vals) {
                            return true;
                        } else {
                            this.$message.error({
                                message: "区间值1应小于区间值2"
                            });
                        }
                    } else {
                        this.$message.error({
                            message: "区间值填写错误"
                        });
                    }
                } else {
                    if (this.checkNumber(this.form.valf, unit)) {
                        return true;
                    } else {
                        this.$message.error({
                            message: "阈值填写错误"
                        });
                    }
                }
                return false
            }, checkNumber(num, unit) {
                if (unit === 'val') {
                    return num === +num
                } else {
                    return num === +num && num <= 100 && num >= 0
                }
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

    >>> .el-timeline-item {
        padding-bottom: 0;
    }

    >>> .el-timeline-item__tail {
        margin-top: 14px;
    }
</style>