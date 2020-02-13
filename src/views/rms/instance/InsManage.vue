<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input v-if="rights('INS_SEARCH')" clearable v-model="query.blurry" placeholder="输入实例名称搜索"
                      style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-button v-if="rights('INS_SEARCH')" class="filter-item" size="mini" type="success" icon="el-icon-search"
                       @click="loadQuery">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button v-if="rights('INS_ADD')" class="filter-item" size="mini" type="primary" icon="el-icon-plus"
                           @click="addInstance">新增
                </el-button>
                <el-button v-if="rights('INS_QUERY')||rights('INS_QUERY_ALL')" type="danger" icon="el-icon-refresh"
                           size="mini" @click="loadData('true')"/>
            </div>
        </div>
        <InstanceForm ref="form" :is-add="isAdd"/>
        <el-divider content-position="left"/>
        <el-table
                :data="instances"
                style="width: 100%;margin-bottom: 20px;"
                v-loading="loading"
                :stripe="true">
            <el-table-column prop="instance_name" align="center" width="200px" label="名称"/>
            <el-table-column prop="mode" align="center" label="连接信息">
                <template slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.type==='Standalone'">{{scope.row.ip+':'+scope.row.port}}
                    </el-tag>
                    <el-tag size="mini" v-if="scope.row.mode===undefined">Unknown</el-tag>
                    <el-tooltip effect="light" :content="JSON.stringify(JSON.parse(scope.row.conn).sentinels)">
                        <el-tag size="mini" v-if="scope.row.type==='SentinelsCluster'">Sentinels</el-tag>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="state" width="70px" align="center" label="状态">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="scope.row.state ? 'success' : 'danger'">{{scope.row.state?'在线':'断开'}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="uptime_in_seconds" align="center" width="160px" label="运行时长">
                <template slot-scope="scope">{{parseTime(scope.row.uptime_in_seconds)}}</template>
            </el-table-column>
            <el-table-column prop="mode" align="center" width="100px" label="模式"/>
            <el-table-column prop="role" align="center" width="80px" label="角色"/>
            <el-table-column prop="os" align="center" width="80px" label="操作系统">
                <template slot-scope="scope">{{scope.row.os.split(" ")[0]}}</template>
            </el-table-column>
            <el-table-column prop="version" align="center" width="70px" label="版本"/>
            <el-table-column prop="arch_bits" align="center" width="50px" label="架构">
                <template slot-scope="scope">{{'x'+scope.row.arch_bits}}</template>
            </el-table-column>
            <el-table-column prop="user" align="center" label="用户" width="80px" v-if="loadColStatus"/>
            <el-table-column prop="ct" align="center" width="190px" label="创建时间">
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span style="margin-left: 10px">{{dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.ct))}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="250px">
                <template slot-scope="scope">
                    <el-button v-if="rights('INS_UPDATE_STATE')" type="text" size="mini"
                               @click="changeState(scope.row)">{{lockBtnTxt(scope.row)}}
                    </el-button>
                    <el-button v-if="rights('INS_UPDATE_CONN')" type="text" size="mini"
                               @click="editConn(scope.row)">连接设置
                    </el-button>
                    <el-button v-if="rights('INS_UPDATE_INFO')" type="text" size="mini"
                               @click="editName(scope.row)">修改名称
                    </el-button>
                    <el-button v-if="rights('INS_REFRESH_META')" type="text" size="mini" :disabled="!scope.row.state"
                               @click="refreshInfo(scope.row)">刷新
                    </el-button>
                    <el-button v-if="rights('INS_DEL')" type="text" size="mini" @click="deleteInstance(scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {
        deleteIns,
        getAll,
        getByUser,
        modifyName,
        modifyState,
        queryBy,
        refreshMeta
    } from "../../../api/redismanage/redis_ins";
    import {dateFormat, parseSec} from "../../../utils/utils";
    import InstanceForm from "./InstanceForm";

    export default {
        name: 'InsManage',
        components: {InstanceForm},
        data() {
            return {
                loading: false, instances: [], isAdd: true,
                identify: this.$store.getters.identify,
                query: {
                    blurry: ''
                }
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData('false');
            })
        }, methods: {
            parseTime(sec) {
                return parseSec(sec);
            },
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            },
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadColStatus() {
                return this.$store.getters.roles.indexOf("ROLE_DEV") !== -1 ||
                    this.$store.getters.roles.indexOf("ROLE_SUPER") !== -1;

            },
            lockBtnTxt(row) {
                return row.state ? '断开' : '连接'
            },
            loadData(update) {
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
            }, loadQuery() {
                this.loading = true;
                if (this.query.blurry === '') {
                    this.loadData('true');
                    return;
                }
                this.instances = [];
                queryBy(this.query).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            }, addInstance() {
                this.isAdd = true;
                const _this = this.$refs.form;
                _this.dialog = true;
            }, editConn(row) {
                this.isAdd = false;
                const _this = this.$refs.form;
                let tmpForm = JSON.parse(row.conn);
                tmpForm.name = row.instance_name;
                tmpForm.id = row.id;
                _this.form = tmpForm;
                _this.dialog = true;
            }, editName(row) {
                this.$prompt('请输入新名称,不得超过20个字符', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValidator: (val) => {
                        return val.length < 20
                    },
                    inputErrorMessage: '名称格式不正确'
                }).then(({value}) => {
                    let form = {
                        id: row.id,
                        name: value
                    };
                    modifyName(form).then((resp) => {
                        if (resp.data.status === 200 && resp.data.code === 'OK') {
                            this.$message({
                                type: 'success',
                                message: '名称修改成功!'
                            });
                            row.instance_name = resp.data.message.instance_name;
                        } else {
                            this.$message({
                                type: 'warning',
                                message: resp.data.message
                            });
                        }
                    }).catch(() => {
                        this.$message.error({
                            message: "名称修改错误!"
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消修改'
                    });
                });
            }, changeState(row) {
                let dto = {
                    id: row.id,
                    name: row.instance_name,
                    state: !row.state
                };
                let prefix = dto.state ? "连接" : "断开";
                modifyState(dto).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            type: 'success',
                            message: prefix + '成功!'
                        });
                    } else {
                        this.$message({
                            type: 'warning',
                            message: prefix + '失败:' + resp.data.message
                        });
                    }
                    this.loadData();
                }).catch(() => {
                    this.loadData();
                    this.$message.error({
                        message: prefix + "错误"
                    });
                })
            }, refreshInfo(row) {
                refreshMeta(row.id).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.$message({
                            type: 'success',
                            message: '刷新成功!'
                        });
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '刷新失败:' + resp.data.message
                        });
                    }
                    this.loadData();
                }).catch(() => {
                    this.loadData();
                    this.$message.error({
                        message: "刷新错误"
                    });
                })
            }, deleteInstance(row) {
                this.$confirm('将删除此实例并清空该实例所有数据, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    deleteIns(row.id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.code === "OK") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '删除失败:' + resp.data.message
                            });
                        }
                        this.loadData();
                        this.unlockLoading();
                    }).catch(() => {
                        this.loadData();
                        this.unlockLoading();
                        this.$message.error({
                            message: "删除错误"
                        });
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            }, lockLoading() {
                this.loadBg = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            }, unlockLoading() {
                this.loadBg.close();
            }
        }
    }
</script>
<style scoped>
    .filter-item {
        margin: 10px 7px;
    }
</style>
