<template>
    <el-dialog :append-to-body="false" :close-on-click-modal="false" :before-close="cancel" :visible.sync="dialog"
               :title="isAdd ? '新增实例' : '连接设置'" width="540px" @close="resetForm">
        <el-form ref="form" :inline="true" :model="form" :rules="rules" size="mini" label-width="80px">
            <el-form-item label="名称" prop="name">
                <el-input maxLength="50" v-model="form.name"/>
            </el-form-item>
            <el-form-item label="模式">
                <el-select v-model="form.poolType" placeholder="请选择" style="width:130px">
                    <el-option v-for="item in options.mode" :key="item.key" :label="item.label" :value="item.key"/>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form.poolType==='sin'" label="IP">
                <el-input maxLength="15" v-model="form.ip"/>
            </el-form-item>
            <el-form-item v-if="form.poolType==='sin'" label="端口">
                <el-input-number label="排序" v-model="form.port" controls-position="right" :min="1" :max="65535"/>
            </el-form-item>
            <el-form-item v-if="form.poolType!=='sin'" label="Master">
                <el-input v-model="form.master"/>
            </el-form-item>
            <el-form-item v-if="form.poolType!=='sin'" label="哨兵">
                <ListBox ref="sentinels" :data="form.sentinels"/>
            </el-form-item>
            <el-divider content-position="right">
                <el-button type="text" @click="showAdvance">高级设置</el-button>
            </el-divider>
            <div v-if="showAdv">
                <el-form-item label="DB">
                    <el-input-number v-model="form.db" controls-position="right" :min="0" :max="15"/>
                </el-form-item>
                <el-form-item label="最大连接">
                    <el-input-number v-model="form.totalCon" controls-position="right" :min="1" :max="1000"/>
                </el-form-item>
                <el-form-item label="MaxWait">
                    <el-input-number v-model="form.maxWait" controls-position="right" :min="1" :max="10000"/>
                </el-form-item>
                <el-form-item label="超时">
                    <el-input-number v-model="form.timeOut" controls-position="right" :min="1000" :max="5000"/>
                </el-form-item>
                <el-form-item label=" ">
                    <label style="margin-left:10px;margin-right:10px">忙时阻塞</label>
                    <el-switch v-model="form.blockWhenExhausted"/>
                    <el-divider direction="vertical"/>
                    <label style="margin-left:10px;margin-right:10px">JMX</label>
                    <el-switch v-model="form.jmx"/>
                    <el-divider direction="vertical"/>
                    <label style="margin-left:10px;margin-right:10px">连接测试</label>
                    <el-switch v-model="form.testOnBorrow"/>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input type="password" v-model="form.password"/>
                </el-form-item>
            </div>

        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="cancel">取消</el-button>
            <el-button :loading="loading" type="primary">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import ListBox from "../../../components/ListBox";

    export default {
        name: "InstanceForm",
        components: {ListBox},
        props: {
            isAdd: {
                type: Boolean,
                required: true
            }
        }, data() {
            return {
                loading: false, dialog: false, showAdv: false,
                form: {
                    id: '', ip: '', port: 6379, name: '', password: null, poolType: 'sin', state: false, db: 0,
                    master: '', blockWhenExhausted: true, testOnBorrow: true, jmx: true, totalCon: 100,
                    maxWait: 1000 * 10, timeOut: 2000, sentinels: []
                },
                options: {
                    mode: [{key: 'sin', label: "单例模式"}, {key: 'sen', label: "哨兵集群"}]
                },
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ]
                }
            }
        }, methods: {
            resetForm() {
                this.dialog = false;
                this.$refs['form'].resetFields();
                this.form = {
                    id: '', ip: '', port: 6379, name: '', password: null, poolType: 'sin', state: false, db: 0,
                    master: '', blockWhenExhausted: true, testOnBorrow: true, jmx: true, totalCon: 100,
                    maxWait: 1000 * 10, timeOut: 2000, sentinels: []
                };
                this.showAdv = false;
            }, cancel() {
                this.resetForm();
            }, showAdvance() {
                this.showAdv = !this.showAdv;
            }
        }
    }
</script>

<style scoped>

</style>