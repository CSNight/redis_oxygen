<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.blurry" placeholder="输入菜单名称搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search">搜索</el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus"
                           @click="addInstance">新增
                </el-button>
                <el-button type="danger" icon="el-icon-refresh" size="mini" @click="loadData"/>
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
                    <el-tag v-if="scope.row.mode==='standalone'">{{scope.row.ip+':'+scope.row.port}}</el-tag>
                    <el-tag v-if="scope.row.mode!=='standalone'">Cluster</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="state" width="80px" align="center" label="状态">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.state ? 'success' : 'danger'">{{scope.row.state?'在线':'断开'}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="uptime_in_seconds" align="center" width="160px" label="运行时长">
                <template slot-scope="scope">{{parseTime(scope.row.uptime_in_seconds)}}</template>
            </el-table-column>
            <el-table-column prop="mode" align="center" width="80px" label="模式"/>
            <el-table-column prop="role" align="center" width="80px" label="角色"/>
            <el-table-column prop="os" align="center" width="80px" label="操作系统"/>
            <el-table-column prop="version" align="center" width="80px" label="版本"/>
            <el-table-column prop="arch_bits" align="center" width="50px" label="架构">
                <template slot-scope="scope">{{'x'+scope.row.arch_bits}}</template>
            </el-table-column>
            <el-table-column prop="user" align="center" label="用户" width="50px" v-if="loadColStatus"/>
            <el-table-column prop="create_time" align="center" width="190px" label="创建时间">
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span style="margin-left: 10px">{{  dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time)) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                    <el-button v-if="rights('INS_UPDATE_STATE')" type="text" size="small"
                               @click="changeState(scope.row)">{{lockBtnTxt(scope.row)}}
                    </el-button>
                    <el-button v-if="rights('INS_UPDATE_CONN')" type="text" size="small"
                               @click="editConn(scope.row)">连接设置
                    </el-button>
                    <el-button v-if="rights('INS_UPDATE_INFO')" type="text" size="small"
                               @click="editName(scope.row)">修改名称
                    </el-button>
                    <el-button v-if="rights('INS_REFRESH_META')" type="text" size="small"
                               @click="refreshInfo(scope.row)">刷新
                    </el-button>
                    <el-button v-if="rights('INS_DEL')" type="text" size="small" @click="deleteInstance(scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {deleteIns, getAll, getByUser, modifyState, refreshMeta} from "../../../api/redismanage/redis_ins";
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
                }, tableData: [],
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
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
            loadData() {
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll();
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
            }, loadAll() {
                getAll().then((resp) => {
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
            }, editName() {

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
                }).catch(() => {
                    this.loadData();
                    this.$message.error({
                        message: "删除错误"
                    });
                })
            }
        }
    }
</script>
<style scoped>
    .filter-item {
        margin: 10px 7px;
    }
</style>
