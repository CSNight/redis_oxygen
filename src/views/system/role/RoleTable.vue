<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.blurry" placeholder="输入角色名称搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="loadQuery">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="addRow">新增
                </el-button>
                <el-button type="danger" icon="el-icon-refresh" size="mini" @click="loadData"></el-button>
                <el-button v-if="show_clear" type="warning" icon="el-icon-delete" size="mini"
                           @click="resetChecked">清空选中
                </el-button>
            </div>
        </div>
        <RoleForm ref="form" :is-add="isAdd"></RoleForm>
        <el-card style="width: 62%;float:left;margin-right: 20px;min-width: 500px;height: 85vh">
            <div slot="header" class="">
                <span>角色列表</span>
            </div>
            <el-table
                    ref="roleTable"
                    :data="RoleList"
                    style="width: 100%;margin-bottom: 20px;font-size: 12px"
                    row-key="name"
                    v-loading="loading"
                    @row-click="rowClick"
                    highlight-current-row>
                <el-table-column
                        prop="name"
                        align="center"
                        label="名称">
                </el-table-column>
                <el-table-column
                        prop="code"
                        align="center"
                        label="编码">
                </el-table-column>
                <el-table-column
                        prop="level"
                        align="center"
                        label="级别">
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
                        fixed="right"
                        align="center"
                        label="操作">
                    <template slot-scope="scope">
                        <el-button
                                v-if="getShow(scope.row.level)"
                                @click.native.prevent="editRow(scope.row)"
                                type="primary"
                                icon="el-icon-edit"
                                size="small">
                        </el-button>
                        <el-button
                                v-if="getShow(scope.row.level)"
                                @click.native.prevent="deleteRow(scope.row)"
                                type="danger"
                                icon="el-icon-delete"
                                size="small">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-card style="width: 35%;min-width: 100px;height: 85vh;overflow: auto">
            <div slot="header" class="">
                <span>权限列表</span>
                <el-button style="float: right;" size="small" type="primary" @click="getChkNode">保存修改</el-button>
            </div>
            <el-collapse v-model="activePanels" style="height: 100%">
                <el-collapse-item title="菜单目录" name="1">
                    <el-tree
                            :props="menuProps"
                            :data="MenuTree"
                            accordion
                            ref="menus"
                            node-key="id"
                            @check-change="checkSetPermitChk"
                            check-on-click-node
                            show-checkbox>
                    </el-tree>
                </el-collapse-item>
                <el-collapse-item title="权限列表" name="2">
                    <el-tree
                            :props="accessProps"
                            :data="PermitTree"
                            accordion
                            check-on-click-node
                            node-key="id"
                            ref="permits"
                            @check-change="checkPermitChk"
                            show-checkbox>
                    </el-tree>
                </el-collapse-item>
            </el-collapse>
        </el-card>
    </div>

</template>

<script>
    import {
        delete_role,
        get_roles,
        query_roles,
        update_role_menus,
        update_role_permits
    } from "../../../api/system/role_api";
    import {get_menu_tree} from "../../../api/system/menu_api";
    import {get_permits} from "../../../api/system/access_api";
    import RoleForm from "./RoleForm";

    export default {
        name: "RoleTable",
        components: {RoleForm},
        data() {
            return {
                loading: false, isAdd: true, select_key: '',
                activePanels: ["1", "2"],
                query: {
                    blurry: ''
                }, menuProps: {
                    children: 'children',
                    label: 'name'
                }, accessProps: {
                    children: 'children',
                    label: 'description'
                },
                RoleList: [],
                MenuTree: [],
                PermitTree: []
            }
        }, computed: {
            show_clear: function () {
                return (this.select_key !== '')
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            });
        }, methods: {
            getShow(level) {
                return level >= 2;
            }, loadQuery() {
                if (this.query.blurry === '') {
                    this.loadData();
                    return;
                }
                this.RoleList = [];
                this.resetChecked();
                this.select_key = '';
                query_roles(this.query).then((resp) => {
                    this.RoleList = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                })
            },
            loadData() {
                this.loading = true;
                this.clearData();
                Promise.all([get_roles(), get_menu_tree(), get_permits()])
                    .then(([roles, menus, permits]) => {
                        this.RoleList = roles.data.message;
                        this.MenuTree = menus.data.message;
                        let permit_list = permits.data.message;
                        let ids = [];
                        for (let i = 0; i < permit_list.length; i++) {
                            let pid = permit_list[i]['menu'].id;
                            if (ids.indexOf(pid) === -1) {
                                ids.push(pid);
                                this.PermitTree.push({
                                    id: pid,
                                    description: permit_list[i]['menu'].name,
                                    children: []
                                })
                            }
                        }
                        for (let i = 0; i < ids.length; i++) {
                            let menu_id = this.PermitTree[i].id;
                            this.PermitTree[i].children = permit_list.filter((v) => {
                                return v['menu'].id === menu_id
                            });
                            for (let j = 0; j < this.PermitTree[i].children.length; j++) {
                                this.PermitTree[i].children[j]['disabled'] = false
                            }
                        }
                        this.loading = false;
                    }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                });
            }, rowClick(row) {
                this.select_key = row.id;
                this.setRolePermit(row, this.setRoleMenu(row));
            }, setRoleMenu(row) {
                let defaultMenu = [];
                let tmp = this.RoleList.filter((role) => {
                    return role.id === row.id
                });
                if (tmp.length > 0) {
                    let menus = tmp[0].menus;
                    for (let i = 0; i < menus.length; i++) {
                        if (menus[i].pid !== 0) {
                            defaultMenu.push(menus[i].id)
                        }
                    }
                }
                this.$refs.menus.setCheckedKeys(defaultMenu);
                return defaultMenu;
            }, setRolePermit(row, menus) {
                let defaultPermit = [];
                let tmp = this.RoleList.filter((role) => {
                    return role.id === row.id
                });
                if (tmp.length > 0) {
                    let permits = tmp[0].permission;
                    for (let i = 0; i < permits.length; i++) {
                        if (menus.indexOf(permits[i].menu.id) !== -1) {
                            defaultPermit.push(permits[i].id)
                        }
                    }
                }
                this.$refs.permits.setCheckedKeys(defaultPermit, true);
            }, addRow() {
                this.isAdd = true;
                const _this = this.$refs.form;
                _this.dialog = true
            }, editRow(row) {
                this.isAdd = false;
                const _this = this.$refs.form;
                _this.form = JSON.parse(JSON.stringify(row));
                _this.dialog = true;
            }, deleteRow(row) {
                this.$confirm('将删除此角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    delete_role(row.id).then((resp) => {
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
            }, checkSetPermitChk(data, chk) {
                let id = data.id;
                let chkPermitKey = this.$refs.permits.getCheckedKeys().concat(this.$refs.permits.getHalfCheckedKeys());
                if (!chk && chkPermitKey.indexOf(id) !== -1) {
                    this.$refs.permits.setChecked(id, false, true)
                }
            }, checkPermitChk(data, chk) {
                let menus_chk = this.$refs.menus.getCheckedKeys();
                if (data.hasOwnProperty('menu') && chk && menus_chk.indexOf(data.menu.id) === -1) {
                    this.$refs.permits.setChecked(data, false)
                }
            }, getChkNode() {
                if (this.select_key === '') {
                    this.$message({
                        type: 'warning',
                        message: '请先选择角色!'
                    });
                    return;
                }
                let permits_chk = this.$refs.permits.getCheckedKeys(true);
                let menus_chk = this.$refs.menus.getCheckedKeys();
                menus_chk = menus_chk.concat(this.$refs.menus.getHalfCheckedKeys());
                let menus = [];
                let permits = [];
                menus_chk.forEach(mid => {
                    menus.push({id: mid})
                });
                permits_chk.forEach(mid => {
                    permits.push({id: mid})
                });
                let form = {
                    id: this.select_key,
                    name: 'update',
                    code: 'update',
                    menuSet: menus,
                    permissionSet: permits
                };
                this.loading = true;
                Promise.all([update_role_menus(form), update_role_permits(form)]).then(() => {
                    this.loadData();
                }).catch((resp) => {
                    this.$message({
                        type: 'warning',
                        message: resp.data.message
                    });
                    this.loadData();
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
            }, clearData() {
                this.select_key = '';
                this.resetChecked();
                this.RoleList = [];
                this.MenuTree = [];
                this.PermitTree = [];
            }, resetChecked() {
                this.$refs.menus.setCheckedKeys([]);
                this.$refs.permits.setCheckedKeys([]);
                this.$refs.roleTable.setCurrentRow();
                this.select_key = '';
            }
        }
    }
</script>

<style scoped>
    .head-container {
        height: 30px;
        margin-bottom: 30px;
    }

    .filter-item {
        margin: 10px 7px;
    }
</style>