<template>
    <div>
        <UserForm ref="form" :is-add="isAdd" :roles="[]" :dept="org_tree"/>
        <el-row>
            <el-col :span="4" style="height:auto;">
                <el-input
                        v-if="rights('ORG_QUERY')"
                        class="filter-item"
                        style="width:70%;height: 30px"
                        size="mini"
                        placeholder="输入部门名称进行过滤"
                        v-model="filterText">
                </el-input>
            </el-col>
            <el-col :span="20" style="height:auto">
                <div class="head-container">
                    <!-- 搜索 -->
                    <el-input v-if="rights('USER_QUERY')" clearable placeholder="输入用户名或手机号搜索" style="width: 200px;"
                              size="mini" class="filter-item" v-model="query.blurry"/>
                    <el-button v-if="rights('USER_QUERY')" class="filter-item" size="mini" type="success"
                               @click="loadQuery" icon="el-icon-search">搜索
                    </el-button>
                    <!-- 新增 -->
                    <div style="display: inline-block;margin: 0 2px;">
                        <el-button v-if="rights('USER_ADD')&&rights('ROLE_QUERY')" class="filter-item" size="mini"
                                   type="primary"
                                   @click="addUser" icon="el-icon-plus">新增
                        </el-button>
                        <el-button v-if="rights('USER_QUERY')" type="danger" icon="el-icon-refresh" size="mini"
                                   @click="loadData"/>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="4" style="height: 85vh;border-right: #dddddd 1px solid">
                <el-scrollbar style="height: 100%;">
                    <div>
                        <el-tree class="filter-tree" :data="org_tree" :props="defaultProps" default-expand-all
                                 @node-click="selectOrg"
                                 :expand-on-click-node="expand_click" :filter-node-method="filterNode" ref="tree">
                        </el-tree>
                    </div>
                </el-scrollbar>
            </el-col>
            <el-col :span="20" style="height: 85vh;overflow: auto">
                <div>
                    <el-table :data="users.slice((currentPage-1)*pg_size,currentPage*pg_size)"
                              style="width: auto;margin-top: 20px;" fixed row-key="username"
                              v-loading="loading">
                        <el-table-column prop="username" align="center" label="名称"/>
                        <el-table-column prop="phone" label="电话" width="120px" align="center"/>
                        <el-table-column prop="email" label="邮箱" align="center"/>
                        <el-table-column prop="enabled" align="center" width="100px" label="状态">
                            <template slot-scope="scope">
                                <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
                                    {{scope.row.enabled?'启用':'禁用'}}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="create_time" width="170px" align="center" label="创建时间">
                            <template slot-scope="scope">
                                <span>{{ dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time)) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="roles" align="center" label="角色">
                            <template slot-scope="scope">
                                <span>{{ get_role_str(scope.row) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="login_times" width="100px" align="center" label="登录次数"/>
                        <el-table-column align="center" label="操作">
                            <template slot-scope="scope">
                                <el-button v-if="rights('USER_UPDATE')&&getShow(scope.row)" type="primary"
                                           icon="el-icon-edit"
                                           @click.native.prevent="editUser(scope.row)&&rights('ROLE_QUERY')"
                                           size="small"/>
                                <el-button v-if="getShow(scope.row)&&rights('USER_DEL')" type="danger"
                                           @click.native.prevent="deleteUser(scope.row)"
                                           icon="el-icon-delete"
                                           size="small"/>
                                <el-button v-if="getShow(scope.row)&&rights('USER_UPDATE')"
                                           :type="lockBtnType(scope.row)"
                                           :icon="lockBtnIcon(scope.row)"
                                           @click.native.prevent="enabledChange(scope.row)" size="small">
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                               :current-page="currentPage" :page-sizes="[5,10]" :page-size="pg_size"
                               layout="total, sizes, prev, pager, next, jumper" :total="users.length"
                               style="float: right">
                </el-pagination>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {get_org_tree} from "../../../api/system/org_api";
    import {delete_user, edit_user, get_org_user, get_users, query_users} from "../../../api/system/user_api";
    import {dateFormat} from "../../../utils/utils";
    import UserForm from "./UserForm";
    import {get_roles} from "../../../api/system/role_api";

    export default {
        name: "UserMain",
        components: {UserForm},
        data() {
            return {
                loading: false, expand_click: false, pg_size: 10, currentPage: 1, isAdd: true, dialog: false,
                filterText: '',
                defaultProps: {
                    children: 'children',
                    label: 'name'
                }, query: {
                    blurry: ''
                },
                users: [], org_tree: [], role_list: [],
            }
        }, watch: {
            filterText(val) {
                this.$refs.tree.filter(val);
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            });
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            getShow(row) {
                let us = row.roles.filter((role) => {
                    return role.code === 'ROLE_DEV' || role.code === 'ROLE_SUPER'
                });
                if (this.$store.getters.roles.indexOf("ROLE_DEV") !== -1) {
                    return true;
                }
                return us.length === 0;
            }, handleSizeChange: function (size) {
                this.pg_size = size;
            }, handleCurrentChange: function (currentPage) {
                this.currentPage = currentPage;
            }, get_role_str(row) {
                let roles = row.roles;
                let str_r = "";
                for (let i = 0; i < roles.length; i++) {
                    str_r += roles[i].name + ",";
                }
                str_r = str_r.substr(0, str_r.lastIndexOf(','));
                return str_r;
            }, lockBtnIcon(row) {
                return row.enabled ? 'el-icon-lock' : 'el-icon-unlock'
            }, dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            }, lockBtnType(row) {
                return row.enabled ? 'warning' : 'success'
            }, filterNode(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
            }, loadQuery() {
                if (this.query.blurry === '') {
                    this.loadData();
                    return;
                }
                this.users = [];
                query_users(this.query).then((resp) => {
                    this.users = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            }, loadData() {
                if (!this.rights("USER_QUERY") || !this.rights("ORG_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                    return;
                }
                this.org_tree = [];
                this.users = [];
                this.loading = true;
                Promise.all([get_org_tree(), get_users()]).then(([orp, urp]) => {
                    this.org_tree.push(orp.data.message);
                    this.users = urp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            }, selectOrg(dt) {
                this.loading = true;
                let org_id = dt.id;
                get_org_user(org_id).then((resp) => {
                    this.users = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                })
            }, enabledChange(row) {
                let row_status = !row.enabled;
                if (row.username === this.$store.getters.name && !row_status) {
                    this.$message.error('不能锁定当前用户!');
                    return;
                }
                let user_ent = JSON.parse(JSON.stringify(row));
                user_ent.enabled = row_status;
                let msg_prefix = row.enabled ? '禁用' : '启用';
                let tit = '此操作将' + msg_prefix + '该用户, 是否继续?';
                this.$confirm(tit, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    edit_user(user_ent).then((resp) => {
                        if (resp.data.status === 200 && resp.data.hasOwnProperty('message')) {
                            this.$message({
                                type: 'success',
                                message: msg_prefix + '成功!'
                            });
                        } else {
                            this.$message.error(msg_prefix + '失败!');
                        }
                        this.loadData();
                        this.unlockLoading();
                    }).catch(() => {
                        this.unlockLoading();
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消操作'
                    });
                })
            }, addUser() {
                this.get_role_list(true, true);
            }, editUser(row) {
                const _this = this.$refs.form;
                _this.form = JSON.parse(JSON.stringify(row));
                let ro = [];
                for (let i = 0; i < _this.form.roles.length; i++) {
                    ro.push(_this.form.roles[i].id);
                }
                _this.form.roles = ro;
                this.get_role_list(false, true);
            }, deleteUser(row) {
                if (row.username === this.$store.getters.name) {
                    this.$message.error('不能删除当前用户!');
                    return;
                }
                this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    delete_user(row.id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message.error('删除失败!');
                        }
                        this.loadData();
                        this.unlockLoading();
                    }).catch(() => {
                        this.unlockLoading();
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            }, get_role_list(add, dialog) {
                const _this = this.$refs.form;
                if (this.role_list.length === 0) {
                    get_roles().then((resp) => {
                        if (resp.data.status === 200 && resp.data.code === 'OK') {
                            this.role_list = resp.data.message;
                            _this.role_select = this.role_list;
                            this.isAdd = add;
                            _this.dialog = dialog
                        } else {
                            this.$message.error({
                                message: "角色列表查询失败!"
                            });
                        }
                    }).catch(() => {
                        this.$message.error({
                            message: "角色列表查询失败!"
                        });
                    })
                } else {
                    _this.role_select = this.role_list;
                    this.isAdd = add;
                    _this.dialog = dialog
                }
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
    /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
    }
</style>