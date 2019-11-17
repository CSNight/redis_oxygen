<template>
    <div>
        <el-row>
            <el-col :span="4" style="height:auto;">
                <el-input
                        class="filter-item"
                        style="width:70%;height: 30px"
                        size="mini"
                        placeholder="输入关键字进行过滤"
                        v-model="filterText">
                </el-input>
            </el-col>
            <el-col :span="20" style="height:auto">
                <div class="head-container">
                    <!-- 搜索 -->
                    <el-input clearable placeholder="输入角色名称搜索" style="width: 200px;" size="mini"
                              class="filter-item"/>
                    <el-button class="filter-item" size="mini" type="success" icon="el-icon-search">搜索
                    </el-button>
                    <!-- 新增 -->
                    <div style="display: inline-block;margin: 0 2px;">
                        <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus">新增
                        </el-button>
                        <el-button type="danger" icon="el-icon-refresh" size="mini" @click="loadData"></el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="4" style="height: 100vh;border-right: #dddddd 1px solid">
                <el-scrollbar style="height: 100%;">
                    <div>
                        <el-tree
                                class="filter-tree"
                                :data="org_tree"
                                :props="defaultProps"
                                default-expand-all
                                :filter-node-method="filterNode"
                                ref="tree">
                        </el-tree>
                    </div>
                </el-scrollbar>
            </el-col>
            <el-col :span="20" style="height: 100vh;overflow: auto">
                <div style="height: 90vh">
                    <el-scrollbar style="height: 100%">
                        <el-table :data="users" style="width: 100%;margin-bottom:20px;" fixed row-key="name"
                                  v-loading="loading">
                            <el-table-column
                                    prop="username"
                                    align="center"
                                    label="名称">
                            </el-table-column>
                            <el-table-column
                                    prop="phone"
                                    label="电话"
                                    align="center"
                                    width="120px">
                            </el-table-column>
                            <el-table-column
                                    prop="email"
                                    label="邮箱"
                                    align="center">
                            </el-table-column>
                            <el-table-column
                                    prop="enabled"
                                    align="center"
                                    label="状态">
                                <template slot-scope="scope">
                                    <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
                                        {{scope.row.enabled?'启用':'禁用'}}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="create_time"
                                    align="center"
                                    label="创建时间">
                                <template slot-scope="scope">
                                    <span style="margin-left: 10px">{{ dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time)) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="roles"
                                    align="center"
                                    label="角色">
                                <template slot-scope="scope">
                                    <span style="margin-left: 10px">{{ get_role_str(scope.row) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    prop="login_times"
                                    align="center"
                                    label="登录次数">
                            </el-table-column>
                            <el-table-column
                                    align="center"
                                    label="操作">
                                <template slot-scope="scope">
                                    <el-button
                                            type="primary"
                                            icon="el-icon-edit"
                                            size="small">
                                    </el-button>
                                    <el-button
                                            type="danger"
                                            icon="el-icon-delete"
                                            size="small">
                                    </el-button>
                                    <el-button
                                            :type="lockBtnType(scope.row)"
                                            :icon="lockBtnIcon(scope.row)"
                                            size="small">
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-scrollbar>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import {get_org_tree} from "@/api/system/org_api";
    import {get_users} from "@/api/system/user_api";
    import {dateFormat} from "@/utils/utils";

    export default {
        name: "UserMain",
        data() {
            return {
                loading: false,
                filterText: '',
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                users: [], org_tree: []
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
            get_role_str(row) {
                let roles = row.roles;
                let str_r = "";
                for (let i = 0; i < roles.length; i++) {
                    str_r += roles[i].name + ",";
                }
                str_r = str_r.substr(0, str_r.lastIndexOf(','));
                return str_r;
            },
            lockBtnIcon(row) {
                return row.enabled ? 'el-icon-lock' : 'el-icon-unlock'
            }, dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            }, lockBtnType(row) {
                return row.enabled ? 'success' : 'warning'
            }, filterNode(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
            }, loadData() {
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
            }
        }
    }
    ;
</script>
<style lang="scss">
    .el-scrollbar {
        .el-scrollbar__wrap {
            overflow-x: hidden;
        }
    }
</style>
<style lang="scss" scoped>


    .filter-item {
        margin: 20px 7px;
    }
</style>