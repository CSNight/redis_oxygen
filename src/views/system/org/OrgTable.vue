<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.name" placeholder="输入部门名称搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-select v-model="query.enabled" clearable placeholder="状态" class="filter-item" style="width: 90px"
                       size="mini" value="" @change="loadQuery">
                <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name"
                           :value="item.key"/>
            </el-select>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="loadQuery">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="new_org">新增
                </el-button>
                <el-button @click.native.prevent="loadData" type="danger" icon="el-icon-refresh" size="mini">
                </el-button>
            </div>
        </div>
        <el-divider content-position="left"></el-divider>
        <OrgForm ref="form" :status="status" :is-add="isAdd"/>
        <div style="height: 90vh">
            <el-scrollbar style="height: 100%">
                <el-table :data="tableData" style="width: 100%;margin-bottom:20px;" fixed row-key="name"
                          v-loading="loading" :stripe="true"
                          default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                    <el-table-column
                            prop="name"
                            label="名称">
                    </el-table-column>
                    <el-table-column
                            prop="id"
                            label="编号"
                            align="center"
                            width="100px">
                    </el-table-column>
                    <el-table-column
                            prop="enabled"
                            align="center"
                            label="状态"
                            width="120px">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">{{scope.row.enabled?'启用':'禁用'}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="create_time"
                            align="center"
                            label="创建时间">
                        <template slot-scope="scope">
                            <i class="el-icon-time"></i>
                            <span style="margin-left: 10px">{{ new Date(scope.row.create_time).toLocaleString() }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="create_user"
                            align="center"
                            label="创建人">
                    </el-table-column>
                    <el-table-column
                            align="center"
                            label="操作">
                        <template slot-scope="scope">
                            <el-button
                                    v-if="getShow(scope.row)"
                                    @click.native.prevent="editRow(scope.row)"
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="small">
                            </el-button>
                            <el-button
                                    v-if="getShow(scope.row)"
                                    @click.native.prevent="deleteRow(scope.row)"
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="small">
                            </el-button>
                            <el-button
                                    v-if="getShow(scope.row)"
                                    @click.native.prevent="lockToggle(scope.row)"
                                    :type="lockBtnType(scope.row)"
                                    :icon="lockBtnIcon(scope.row)"
                                    size="small">
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-scrollbar>
        </div>
    </div>
</template>

<script>
    import {delete_org, get_org_by, get_org_tree, modify_org, query_by} from '../../../api/system/org_api'
    import OrgForm from './OrgForm'

    export default {
        components: {OrgForm},
        data() {
            return {
                tableData: [],
                org_tree_select: [],
                status: [{id: 1, value: true, label: '启用'}, {id: 2, value: false, label: '禁用'}],
                loading: true,
                isAdd: true,
                enabledTypeOptions: [
                    {key: 'true', display_name: '正常'},
                    {key: 'false', display_name: '禁用'}
                ], query: {
                    name: '',
                    enabled: ''
                }
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData();
            });
        },
        computed: {},
        methods: {
            getShow: (row) => {
                return row.name !== 'Top'
            },
            lockBtnIcon(row) {
                return row.enabled ? 'el-icon-lock' : 'el-icon-unlock'
            },
            lockBtnType(row) {
                return row.enabled ? 'success' : 'warning'
            },
            loadData() {
                this.loading = true;
                this.tableData = [];
                get_org_tree().then((resp) => {
                    this.tableData.push(resp.data.message);
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                });
                this.loadSelectTree();
            },
            loadSelectTree() {
                this.org_tree_select = [];
                get_org_by({id: 1, enabled: true}).then((resp) => {
                    this.org_tree_select.push(resp.data.message);
                })
            },
            loadQuery() {
                if (this.query.name === '' && this.query.enabled === '') {
                    this.loadData();
                    return;
                }
                let params = {name: this.query.name};
                if (this.query.enabled !== '') {
                    params['enabled'] = this.query.enabled === 'true';
                }
                this.tableData = [];
                query_by(params).then((resp) => {
                    this.tableData = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            },
            new_org() {
                this.isAdd = true;
                const _this = this.$refs.form;
                _this.org_tree_select = JSON.parse(JSON.stringify(this.org_tree_select));
                _this.dialog = true
            },
            deleteRow(row) {
                this.$confirm('此操作将该部门及子部门将一起删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    delete_org(row.id).then((resp) => {
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
            },
            editRow(row) {
                this.isAdd = false;
                const _this = this.$refs.form;
                _this.org_tree_select = JSON.parse(JSON.stringify(this.tableData));
                _this.form = {
                    id: row.id,
                    name: row.name,
                    pid: row.pid,
                    create_time: row.create_time,
                    create_user: row.create_user,
                    enabled: row.enabled
                };
                _this.dialog = true;
            },
            lockToggle(row) {
                let row_status = !row.enabled;
                let org_ent = {
                    id: row.id,
                    name: row.name,
                    enabled: row_status,
                    pid: row.pid,
                    create_user: row.create_user,
                    create_time: row.create_time
                };
                let msg_prefix = row.enabled ? '锁定' : '解锁';
                let tit = '此操作将该部门及子部门将一起' + msg_prefix + ', 是否继续?';
                this.$confirm(tit, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    modify_org(org_ent).then((resp) => {
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
            },
            lockLoading() {
                this.loadBg = this.$loading({
                    lock: true,
                    text: 'Loading',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            },
            unlockLoading() {
                this.loadBg.close();
            }
        }
    }
</script>
<style lang="scss" scoped>
    .head-container {
        height: 30px;
    }

    .filter-item {
        margin: 10px 7px;
    }


</style>