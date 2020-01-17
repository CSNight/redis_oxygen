<template>
    <el-row style="margin-top: 10px">
        <el-col :span="6">
            <el-card style="height:85vh">
                <div slot="header">
                    <span>实例列表</span>
                    <el-button style="float: right; padding: 3px 3px" size="mini" type="primary" icon="el-icon-refresh"
                               v-if="rights('DBA_QUERY')||rights('DBA_QUERY_ALL')" @click="loadData">刷新实例列表
                    </el-button>
                </div>
                <div style="height:75vh;overflow-y: auto">
                    <el-tree class="filter-tree" :data="instances" accordion :props="treeProps" ref="tree">
                        <span class="custom-tree-node" slot-scope="{ node,data }">
                            <span>
                                <el-button size="mini" :icon="getIcon(data.type)"
                                           :class="'ins '+(data.type==='db'?'dbBtn':'')">{{ node.label }}</el-button>
                                <el-tag v-if="data.type==='db'" style="margin-left: 10px" size="mini"
                                        :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                            </span>
                            <span v-if="data.type==='ins'">
                                <el-tag style="margin-right: 10px" size="mini" :type="getTagType(data)">{{getTagText(data)}}</el-tag>
                                <el-button type="text" size="mini" v-if="rights('DBA_QUERY_SINGLE')"
                                           @click="loadById(data)">刷新</el-button>
                            </span>
                        </span>
                    </el-tree>
                </div>
            </el-card>
        </el-col>
        <el-col :span="18" style="padding-left: 10px">
            <el-card style="height: 85vh">
                <div slot="header">操作配置</div>
                <div style="overflow: auto;width:50%">
                    <el-form inline size="mini" label-width="100px">
                        <el-collapse style="height:70vh;overflow-y: auto" v-model="collaspes">
                            <el-collapse-item title="基础设置" :name="1">
                                <el-form-item label="源实例">
                                    <el-select v-model="configs.sourceId" style="width: 130px" clearable>
                                        <el-option v-for="t in instances" :key="t.id" :label="t.instance_name"
                                                   :value="t.id"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item v-if="['restore','sync'].indexOf(configs.mode)!==-1" label="目标实例">
                                    <el-select v-model="configs.targetId" style="width: 130px" clearable>
                                        <el-option v-for="t in instances" :key="t.id" :label="t.instance_name"
                                                   :value="t.id"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="操作类型">
                                    <el-select v-model="configs.mode" style="width: 130px" @change="configs.targetId=''">
                                        <el-option v-for="t in opMode" :key="t.value" :label="t.label"
                                                   :value="t.value"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="并发线程数">
                                    <el-input-number v-model="configs.parallel" controls-position="right" :min="1"
                                                     :max="64"/>
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
                                <el-form-item label="源实例类型">
                                    <el-select v-model="configs.source.type">
                                        <el-option v-for="t in insType" :key="t.value" :label="t.label"
                                                   :value="t.value"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="源实例地址">
                                    <el-input v-model="configs.source.address"/>
                                </el-form-item>
                                <el-form-item label="源实例密码">
                                    <el-input v-model="configs.source.password_raw"/>
                                </el-form-item>
                                <el-form-item label="启用TLS">
                                    <el-switch v-model="configs.source.tls_enable"/>
                                </el-form-item>
                                <el-form-item v-if="['restore','decode'].indexOf(configs.mode)!==-1" label="恢复数据文件">
                                    <el-input v-model="configs.source.rdb.input"/>
                                </el-form-item>
                            </el-collapse-item>
                            <el-collapse-item title="目标实例设置" :name="3">
                                <el-form-item label="目标实例类型">
                                    <el-select :disabled="['dump','rump','decode'].indexOf(configs.mode)!==-1"
                                               v-model="configs.target.type">
                                        <el-option v-for="t in insType" :key="t.value" :label="t.label"
                                                   :value="t.value"/>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="目标实例地址">
                                    <el-input :disabled="['dump','rump','decode'].indexOf(configs.mode)!==-1"
                                              v-model="configs.target.address"/>
                                </el-form-item>
                                <el-form-item label="目标实例密码">
                                    <el-input :disabled="['dump','rump','decode'].indexOf(configs.mode)!==-1"
                                              v-model="configs.target.password_raw"/>
                                </el-form-item>
                                <el-form-item label="启用TLS">
                                    <el-switch :disabled="['dump','rump','decode'].indexOf(configs.mode)!==-1"
                                               v-model="configs.target.tls_enable"/>
                                </el-form-item>
                                <el-form-item v-if="['dump','rump','decode'].indexOf(configs.mode)!==-1" label="备份数据文件">
                                    <el-input v-model="configs.target.rdb.output"/>
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
                    <div style="float: right;margin-top: 10px">
                        <el-button type="primary" size="mini">执行</el-button>
                        <el-button v-if="configs.mode==='sync'" type="primary" size="mini">停止</el-button>
                    </div>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import {getAll, getByIns, getByUser} from "../../../api/redismanage/redis_dba";

    export default {
        name: "DataSync",
        data() {
            return {
                instances: [],
                collaspes: [1, 2, 3, 4],
                identify: this.$store.getters.identify,
                treeProps: {label: 'label', children: 'children'},
                dbTabs: [],
                currentTabName: "",
                tabIndex: 0,
                insType: [
                    {value: 'standalone', label: '单例模式'},
                    {value: 'sentinel', label: '哨兵模式'},
                    {value: 'cluster', label: '集群模式'},
                    {value: 'proxy', label: '代理模式'}],
                filterMode: ['db', 'key', 'slot', 'lua'],
                opMode: [
                    {value: 'dump', label: 'RDB模式备份'},
                    {value: 'rump', label: 'Scan模式备份'},
                    {value: 'restore', label: '数据还原'},
                    {value: 'sync', label: '实例间数据同步'},
                    {value: 'decode', label: 'RDB解析'}],
                configs: {
                    mode: 'dump',
                    targetId: '',
                    sourceId: '',
                    source: {
                        type: 'standalone',
                        address: '',
                        password_raw: '',
                        tls_enable: '',
                        rdb: {
                            input: '',
                            parallel: 0
                        }
                    }, target: {
                        type: 'standalone',
                        address: '',
                        password_raw: '',
                        tls_enable: '',
                        db: -1,
                        version: '',
                        rdb: {
                            output: '',
                        }
                    },
                    parallel: 32,
                    fake_time: '',
                    rewrite: true,
                    big_key_threshold: 524288000,
                    qps: 200000,
                    keep_alive: 0,
                    filter: {
                        db: {whitelist: '', blacklist: ''},
                        key: {whitelist: '', blacklist: ''},
                        slot: '',
                        lua: false
                    }, sender: {
                        size: 104857600,
                        count: 4095,
                        delay_channel_size: 65535,
                    }, scan: {
                        key_number: 50,
                        special_cloud: '',
                        key_file: ''
                    }
                }
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData();
            })
        },
        methods: {
            btnState(ins) {
                return !ins.state;
            }
            ,
            getIcon(type) {
                switch (type) {
                    case"ins":
                        return "fac fa fa-codepen";
                    case"db":
                        return "fac fa fa-database";
                }
            }
            ,
            getTagText(item) {
                if (item.hasOwnProperty('reachable') && item.type === 'ins') {
                    if (item.reachable) {
                        return 'db:' + item.dbCount
                    } else {
                        return 'disconnect'
                    }
                } else if (item.type === "db") {
                    return 'keys:' + item.keySize;
                }
            }
            ,
            getTagType(item) {
                if (item.hasOwnProperty('reachable') && item.type === 'ins') {
                    if (item.reachable) {
                        return 'success'
                    } else {
                        return 'danger'
                    }
                } else {
                    return 'primary'
                }
            }
            ,
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }
            ,
            loadData() {
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
                this.dbTabs.pop();
            }
            ,
            loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
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
            }
            ,
            loadAll() {
                getAll().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
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
            }
            ,
            loadById(ins) {
                if (this.dbTabs.length > 0 && this.dbTabs[0].ins === ins.id) {
                    this.dbTabs.pop();
                }
                getByIns(ins.id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let insNew = resp.data.message;
                        for (let i = 0; i < this.instances.length; i++) {
                            if (this.instances[i].id === insNew.id) {
                                this.$set(this.instances, i, insNew);
                                break;
                            }
                        }
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
            }
            ,
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


</style>
