<template>
    <el-row style="margin-top: 10px">
        <el-col :span="9" class="el-card is-always-shadow" style="height:85vh;padding:0 0 0 10px;">
            <el-form inline size="mini" style="height:80vh;overflow-y:auto;" label-width="100px" v-model="configs">
                <el-collapse style="height: auto" v-model="collaspes">
                    <el-collapse-item title="基础设置" :name="1">
                        <el-form-item label="操作类型">
                            <el-select v-model="configs.mode" @change="configs.targetId=''">
                                <el-option v-for="t in opMode" :key="t.value" :label="t.label" :value="t.value"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="并发线程数">
                            <el-input-number v-model="configs.parallel" controls-position="right" :min="1" :max="64"/>
                        </el-form-item>
                        <el-form-item label="同步时重写">
                            <el-switch v-model="configs.rewrite"/>
                        </el-form-item>
                        <el-form-item v-if="'rump'===configs.mode" label="扫描键并发数">
                            <el-input-number controls-position="right" :min="1" :max="100"
                                             v-model="configs.scan.key_number"/>
                        </el-form-item>
                    </el-collapse-item>
                    <el-collapse-item title="源实例设置" :name="2">
                        <el-form-item label="源实例">
                            <el-select v-model="configs.sourceId" clearable @change="selectSource">
                                <el-option v-for="t in instances" :key="t.id" :label="t.instance_name" :value="t.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="源实例类型">
                            <el-select v-model="configs.source.type" disabled>
                                <el-option v-for="t in insType" :key="t.value" :label="t.label" :value="t.value"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="源实例地址" style="width: 100%">
                            <el-input readonly style="width:400px" v-model="configs.source.address"/>
                        </el-form-item>
                        <el-form-item label="源操作角色"
                                      v-if="configs.source.type==='sentinel'&&checkEmpty(configs.source.address)">
                            <el-select v-model="configs.source.role" @change="selectSourceRole">
                                <el-option v-for="t in opTarget" :key="t" :label="t" :value="t"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="源实例密码">
                            <el-input v-model="configs.source.password_raw"/>
                        </el-form-item>
                        <el-form-item label="启用TLS">
                            <el-switch v-model="configs.source.tls_enable"/>
                        </el-form-item>
                    </el-collapse-item>
                    <el-collapse-item title="目标实例设置" :name="3">
                        <el-form-item v-if="['rump','restore','sync'].indexOf(configs.mode)!==-1" label="目标实例">
                            <el-select v-model="configs.targetId" clearable @change="selectTarget">
                                <el-option v-for="t in instances" :key="t.id" :label="t.instance_name" :value="t.id"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="目标实例类型">
                            <el-select disabled v-model="configs.target.type">
                                <el-option v-for="t in insType" :key="t.value" :label="t.label" :value="t.value"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="目标操作角色"
                                      v-if="configs.target.type==='sentinel'&&checkEmpty(configs.target.address)">
                            <el-select v-model="configs.target.role" @change="selectTargetRole">
                                <el-option v-for="t in opTarget" :key="t" :label="t" :value="t"/>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="目标实例地址">
                            <el-input readonly style="width:400px"
                                      :disabled="['dump','decode'].indexOf(configs.mode)!==-1"
                                      v-model="configs.target.address"/>
                        </el-form-item>
                        <el-form-item label="目标实例密码">
                            <el-input :disabled="['dump','decode'].indexOf(configs.mode)!==-1"
                                      v-model="configs.target.password_raw"/>
                        </el-form-item>
                        <el-form-item label="启用TLS">
                            <el-switch :disabled="['dump','decode'].indexOf(configs.mode)!==-1"
                                       v-model="configs.target.tls_enable"/>
                        </el-form-item>
                        <el-form-item label="目标DB-Index">
                            <el-input-number :disabled="['dump','decode'].indexOf(configs.mode)!==-1"
                                             v-model="configs.target.db" controls-position="right" :min="-1" :max="64"/>
                        </el-form-item>
                        <el-form-item v-if="['restore','decode'].indexOf(configs.mode)!==-1" label="恢复数据文件">
                            <el-input v-model="configs.source.rdb.input"/>
                        </el-form-item>
                    </el-collapse-item>
                    <el-collapse-item title="过滤设置" :name="4">
                        <el-form-item label="过滤DB白名单">
                            <el-input placeholder="过滤key前缀,分号分隔" v-model="configs.filter.db.whitelist"/>
                        </el-form-item>
                        <el-form-item label="过滤DB黑名单">
                            <el-input placeholder="过滤key前缀,分号分隔" v-model="configs.filter.db.blacklist"/>
                        </el-form-item>
                        <el-form-item label="过滤Key白名单">
                            <el-input placeholder="DB序号,分号分隔" v-model="configs.filter.db.whitelist"/>
                        </el-form-item>
                        <el-form-item label="过滤Key黑名单">
                            <el-input placeholder="DB序号,分号分隔" v-model="configs.filter.db.blacklist"/>
                        </el-form-item>
                        <el-form-item label="过滤槽(Cluster)">
                            <el-input placeholder="槽序号,分号分隔" v-model="configs.filter.slot"/>
                        </el-form-item>
                        <el-form-item label="过滤Lua脚本">
                            <el-switch v-model="configs.filter.lua"/>
                        </el-form-item>
                    </el-collapse-item>
                </el-collapse>
            </el-form>
            <div style="float: right;margin:10px">
                <el-button :disabled="canExec" type="primary" size="mini" :loading="loading" @click="executeTask">执行
                </el-button>
                <el-button :disabled="!canExec" type="primary" size="mini" @click="stopProcess">停止</el-button>
            </div>
        </el-col>
        <el-col :span="15" style="height:85vh;">
            <el-card style="height: 50%;margin-left: 10px;" class="log-panel" ref="log">
                <div slot="header">
                    <span>操作日志</span>
                    <el-button style="float: right; padding: 3px 3px" size="mini" type="primary" icon="el-icon-delete"
                               @click="logs=''">清空日志
                    </el-button>
                </div>
                <el-input v-model="logs" readonly type="textarea" autosize :resize="'none'"/>
            </el-card>
            <RecordTable ref="records" :instances="instances"/>
        </el-col>
    </el-row>
</template>

<script>
    import {getAll, getByIns, getByUser} from "../../../api/redismanage/redis_dba";
    import {newConf} from "../../../api/redismanage/redis_dump";
    import {guid} from "../../../utils/utils";
    import RecordTable from "./RecordTable";

    export default {
        name: "DataSync",
        components: {RecordTable},
        data() {
            return {
                instances: [],
                collaspes: [1, 2, 3, 4],
                identify: this.$store.getters.identify,
                appId: guid(),
                treeProps: {label: 'label', children: 'children'},
                insType: [{value: 'standalone', label: '单例模式'}, {value: 'sentinel', label: '哨兵模式'},
                    {value: 'cluster', label: '集群模式'}, {value: 'proxy', label: '代理模式'}],
                filterMode: ['db', 'key', 'slot', 'lua'],
                opTarget: ['master', 'slave'],
                opMode: [{value: 'dump', label: 'RDB模式备份'}, {value: 'rump', label: 'Scan模式备份'},
                    {value: 'restore', label: '数据还原'}, {value: 'sync', label: '实例间数据同步'},
                    {value: 'decode', label: 'RDB解析'}],
                configs: {
                    mode: 'dump', targetId: '', sourceId: '',
                    source: {
                        type: 'standalone', address: '', password_raw: '', role: 'slave', tls_enable: false,
                        auth_type: 'auth', rdb: {input: '', parallel: 0}
                    }, target: {
                        type: 'standalone', address: '', role: 'master', password_raw: '', tls_enable: false,
                        db: -1, version: '', rdb: {output: ''}
                    }, parallel: 64, fake_time: '', rewrite: true,
                    filter: {
                        db: {whitelist: '', blacklist: ''}, key: {whitelist: '', blacklist: ''}, slot: '', lua: false
                    },
                    sender: {size: 104857600, count: 4095, delay_channel_size: 65535,},
                    scan: {key_number: 50, special_cloud: '', key_file: ''}
                },
                logs: '',
                canExec: false,
                loading: false
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData();
                this.$wss.on("dtRev", this.handlerMsg, this.appId);
                this.$wss.connect(this.identify);
            })
        },
        methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadData() {
                if (!this.rights("DBA_QUERY_ALL") && !this.rights("DBA_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("DBA_QUERY_ALL")) {
                    this.instances = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                        this.$refs.records.loadShakeRec();
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadAll() {
                getAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                        this.$refs.records.loadShakeRec();
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadById(ins) {
                getByIns(ins.id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let insNew = resp.data.message;
                        for (let i = 0; i < this.instances.length; i++) {
                            if (this.instances[i].id === insNew.id) {
                                this.$set(this.instances, i, insNew);
                                break;
                            }
                        }
                        this.$refs.records.loadShakeRec();
                    } else {
                        this.$message.error({
                            message: "刷新出错!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "刷新出错!" + resp.data.message
                    });
                })
            }, selectSource() {
                if (this.checkTargetSource()) {
                    this.configs.sourceId = '';
                    return;
                }
                let source = this.getInstanceById(this.configs.sourceId);
                let conn = JSON.parse(source.conn);
                if (source.type === "Standalone") {
                    this.configs.source.address = source.ip + ":" + source.port;
                    this.configs.source.type = "standalone";
                } else if (source.type === "SentinelsCluster") {
                    this.configs.source.address = conn.master + ":slave@" + conn.sentinels.join(';');
                    this.configs.source.type = "sentinel";
                }
                if (conn.hasOwnProperty('password')) {
                    this.configs.source.password_raw = conn.password;
                } else {
                    this.configs.source.password_raw = '';
                }
            }, selectTarget() {
                if (this.checkTargetSource()) {
                    this.configs.targetId = '';
                    return;
                }
                let target = this.getInstanceById(this.configs.targetId);
                let conn = JSON.parse(target.conn);
                if (target.type === "Standalone") {
                    this.configs.target.address = target.ip + ":" + target.port;
                    this.configs.target.type = "standalone";
                } else if (target.type === "SentinelsCluster") {
                    this.configs.target.address = conn.master + ":" + this.configs.target.role + "@" + conn.sentinels.join(';');
                    this.configs.target.type = "sentinel";
                }
                if (conn.hasOwnProperty('password')) {
                    this.configs.target.password_raw = conn.password;
                } else {
                    this.configs.target.password_raw = '';
                }
            }, selectSourceRole() {
                //切换dump/restore读取的集群角色
                this.configs.source.address = this.configs.source.address.replace(/:\S*@/, ":" + this.configs.source.role + '@')
            }, selectTargetRole() {
                //切换dump/restore读取的集群角色
                this.configs.target.address = this.configs.target.address.replace(/:\S*@/, ":" + this.configs.target.role + '@')
            }, getInstanceById(ins_id) {
                for (let i = 0; i < this.instances.length; i++) {
                    if (this.instances[i].id === ins_id) {
                        return this.instances[i]
                    }
                }
            }, checkTargetSource() {
                //检查源实例与目标实例冲突
                if (this.configs.mode === 'sync'
                    && this.checkEmpty(this.configs.sourceId)
                    && this.checkEmpty(this.configs.targetId)
                    && this.configs.sourceId === this.configs.targetId) {
                    this.$message.error({
                        message: '源实例不能与目标实例相同'
                    });
                    return true;
                }
                return false;
            }, checkEmpty(source) {
                return !(source === '' || source === null || source === undefined);
            }, executeTask() {
                this.canExec = true;
                this.loading = true;
                if (this.checkParams()) {
                    let dto = {
                        type: this.configs.mode,
                        configs: JSON.stringify(this.configs)
                    };
                    newConf(dto).then((resp) => {
                        if (resp.data.status === 200 && resp.data.code === "OK") {
                            this.logs += new Date().toLocaleString() + ": Generate Config File Complete Details:\r\nFilename: "
                                + resp.data.message.filepath + "\r\nConfigDetail: "
                                + JSON.stringify(JSON.parse(resp.data.message.conf), null, 4) + "\r\n";
                            this.$wss.send(JSON.stringify(resp.data.message), 200, this.appId, "", 'dt_operation')
                        } else {
                            this.$message.error({
                                message: "生成配置文件失败,请检查配置项 " + resp.data.message
                            });
                            this.canExec = false;
                            this.loading = false;
                        }
                    }).catch(() => {
                        this.$message.error({
                            message: "生成配置文件失败,请检查配置项"
                        });
                        this.canExec = false;
                        this.loading = false;
                    })
                } else {
                    this.$message.error({
                        message: "请检查参数配置是否正确"
                    });
                    this.canExec = false;
                    this.loading = false;
                }
            }, checkParams() {
                //生成配置文件前检查参数有效性
                if (this.configs.mode === 'dump') {
                    return this.checkEmpty(this.configs.source.address)
                        && this.checkEmpty(this.configs.source.type)

                }
                if (this.configs.mode === "rump") {
                    return this.checkEmpty(this.configs.source.address)
                        && this.checkEmpty(this.configs.source.type)
                        && this.checkEmpty(this.configs.target.address)
                        && this.checkEmpty(this.configs.target.type)
                        && this.configs.scan.key_number > 0;
                }
                if (this.configs.mode === "restore") {
                    return this.checkEmpty(this.configs.target.address)
                        && this.checkEmpty(this.configs.target.type)
                        && this.checkEmpty(this.configs.source.rdb.input)
                }
                if (this.configs.mode === "sync") {
                    return this.checkEmpty(this.configs.target.address)
                        && this.checkEmpty(this.configs.target.type)
                        && this.checkEmpty(this.configs.source.address)
                        && this.checkEmpty(this.configs.source.type)
                }
                if (this.configs.mode === "decode") {
                    return this.checkEmpty(this.configs.source.rdb.input)
                }
            }, handlerMsg(e) {
                if (e.rmt === "SHAKEFINISH" || e.rmt === "ERROR") {
                    this.canExec = false;
                    this.loading = false;
                    this.$refs.records.loadShakeRec();
                }
                if (this.logs.length > 20000) {
                    this.logs = '';
                }
                this.logs += e.body + "\r\n";

                this.$refs.log.$el.children[1].scrollTop = this.$refs.log.$el.children[1].scrollHeight + 10;

            }, stopProcess() {
                this.$wss.send("", 201, this.appId, "", 'dt_operation')
            }
        }, beforeDestroy() {
            this.$wss.un("dtRev", this.appId);
            this.$wss.close();
        }
    }
</script>

<style lang="scss" scoped>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;

        /deep/ .ins {
            background: transparent;
            border: none;
            height: 25px;
            max-width: 170px;
            padding-left: 0;
            overflow: hidden;
        }

        /deep/ .dbBtn {
            width: 60px;
            padding-right: 22px;
        }

        /deep/ .fac {
            margin-right: 5px;
        }
    }

    /deep/ .el-form-item__label {
        font-size: 11px;
    }

    /deep/ .el-select, .el-switch {
        width: 160px
    }

    /deep/ .log-panel > .el-card__body {
        padding: 0 !important;
        overflow-y: auto;
        height: 35vh;

        .el-textarea__inner {
            border: none;
            font-size: 11px;
            overflow: hidden;
        }
    }

</style>
