<template>
    <el-card style="margin-left: 10px;height:100%;">
        <div slot="header" class="">
            <span>操作日志</span>
        </div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.value" placeholder="输入查询条件" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-select v-model="query.key" clearable placeholder="关键字" class="filter-item" style="width: 90px"
                       size="mini" value="">
                <el-option v-if="hasRole()" key="un" label="用户" value="un"/>
                <el-option v-for="item in filter" :key="item.key" :label="item.label" :value="item.key"/>
            </el-select>
            <el-date-picker v-model="query.st_et" size="mini" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期">
            </el-date-picker>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="loadQuery">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button @click="loadData" type="danger" icon="el-icon-refresh" size="mini"/>
                <el-button v-if="rights('OPLOG_CLEAR')" @click="clear_log" type="warning" icon="el-icon-delete"
                           size="mini"/>
            </div>
        </div>
        <el-table
                ref="roleTable"
                :data="logs"
                style="width: 100%;margin-bottom: 20px;font-size: 12px"
                row-key="name"
                v-loading="loading"
                highlight-current-row>
            <el-table-column prop="create_time" align="center" label="创建时间">
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span style="margin-left: 10px">{{  dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.ct)) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="ip" align="center" label="IP">
            </el-table-column>
            <el-table-column prop="mo" align="center" label="模块">
            </el-table-column>
            <el-table-column prop="un" align="center" label="用户">
            </el-table-column>
            <el-table-column prop="op" align="center" label="操作">
            </el-table-column>
            <el-table-column prop="st" align="center" label="状态">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="getStType(scope.row.st)">{{scope.row.st}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="cost" align="center" sortable label="耗时">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="getCostType(scope.row.cost)">{{getCostFormat(scope.row.cost)}}</el-tag>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="cur"
                :page-sizes="[5,10,15]"
                :page-size="pg_size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                style="float: right;margin-bottom: 30px">
        </el-pagination>
    </el-card>
</template>

<script>
    import {clear_logs, get_logs, query_logs} from "../../../api/system/log_api";
    import {dateFormat} from "../../../utils/utils";
    import {get_users} from "../../../api/system/user_api";

    export default {
        name: "LogTable",
        data() {
            return {
                logs: [], loading: false, pg_size: 10, cur: 1, total: 0, users: [], clear: this.$store.getters.name,
                query: {
                    key: '',
                    value: '',
                    st_et: [],
                    sort: 'ct',
                    direct: 'asc'
                },
                filter: [{key: 'ip', label: "IP"},
                    {key: 'op', label: "操作"},
                    {key: 'mo', label: "模块"},
                    {key: 'st', label: "状态"}],
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData();
            })
        }, methods: {
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            hasRole() {
                return this.$store.getters.roles.indexOf("ROLE_DEV") !== -1 || this.$store.getters.roles.indexOf("ROLE_SUPER") !== -1
            },
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            },
            getStType(st) {
                if (st <= 300) {
                    return 'primary'

                } else if (st >= 300 && st < 400) {
                    return 'warning'
                } else {
                    return 'error'
                }
            },
            getCostType(cost) {
                if (cost <= 100) {
                    return 'success'

                } else if (cost >= 100 && cost < 500) {
                    return 'primary'
                } else if (cost >= 500 && cost < 1000) {
                    return 'warning'
                } else {
                    return 'danger'
                }
            },
            getCostFormat(cost) {
                if (cost < 1000) {
                    return cost + "ms"
                } else {
                    return cost / 1000.0 + "s"
                }
            },
            loadData() {
                this.query.key = '';
                this.query.value = '';
                this.loading = true;
                get_logs(this.$store.getters.name, this.cur, this.pg_size).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.logs = resp.data.message.content;
                        this.total = resp.data.message.totalElements;
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
                })
            }, loadQuery() {
                this.loading = true;
                let params = {
                    un: this.$store.getters.name,
                    cur: this.cur,
                    size: this.pg_size,
                    sort: this.query.sort,
                    direct: this.query.direct
                };
                if ((this.$store.getters.roles.indexOf("ROLE_DEV") !== -1 ||
                    this.$store.getters.roles.indexOf("ROLE_SUPER") !== -1) && this.query.key === 'un') {
                    params['un'] = this.query.value;
                } else if (this.query.key !== '' && this.query.value != null && this.query.value !== "") {
                    params[this.query.key] = this.query.value;
                    if (this.query.key === 'mo') {
                        params[this.query.key] = this.query.value.toUpperCase();
                    }
                }
                if (this.query.st_et !== null && this.query.st_et.length !== 0) {
                    params['std'] = this.query.st_et[0].toString();
                    params['etd'] = this.query.st_et[1].toString();
                }
                query_logs(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === 'OK') {
                        this.logs = resp.data.message.content;
                        this.total = resp.data.message.totalElements;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.response.data.message
                    });
                })
            }, clear_log() {
                if (this.hasRole()) {
                    get_users().then((resp) => {
                        this.users = resp.data.message;
                        this.renderMsg();
                    })
                }
            },
            renderMsg() {
                const h = this.$createElement;
                let options = [];
                for (let i = 0; i < this.users.length; i++) {
                    options.push(h('el-option', {
                        attrs: {
                            value: this.users[i].username,
                            label: this.users[i].username
                        }
                    }))
                }
                options.push(h('el-option', {
                    attrs: {
                        value: "all",
                        label: "all"
                    }
                }));
                let el = h("el-select", {
                    props: {
                        value: this.clear,
                        size: 'mini'
                    }, on: {
                        input: (e) => {
                            _this.clear = e;
                            el.elm.children["0"].firstElementChild.value = e;
                        }
                    },
                }, options);
                const _this = this;
                this.$msgbox({
                    title: '消息',
                    message: h('div', [
                        h("div", "请选择需要清空日志的用户"), el
                    ]),
                    showCancelButton: true,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(() => {
                    clear_logs(this.clear).then((resp) => {
                        this.$message({
                            type: "success",
                            message: resp.data.message
                        });
                        this.loadData();
                    }).catch((resp) => {
                        this.$message.error({
                            message: "请求出错!" + resp.response.data.message
                        });
                        this.loadData();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消操作'
                    });
                });
            },
            handleSizeChange: function (size) {
                this.pg_size = size;
                this.loadQuery();
            },
            handleCurrentChange: function (currentPage) {
                this.cur = currentPage;
                this.loadQuery();
            }
        }
    }
</script>