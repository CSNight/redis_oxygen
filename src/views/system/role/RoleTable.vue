<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input v-if="rights('ROLE_QUERY')" clearable v-model="query.blurry" placeholder="输入角色名称搜索"
                      style="width: 200px;" size="mini" class="filter-item"/>
            <el-button class="filter-item" v-if="rights('ROLE_QUERY')" size="mini" type="success" icon="el-icon-search"
                       @click="loadQuery">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" v-if="rights('ROLE_ADD')" size="mini" type="primary" icon="el-icon-plus"
                           @click="addRow">新增
                </el-button>
                <el-button type="danger" v-if="rights('ROLE_QUERY')" icon="el-icon-refresh" size="mini"
                           @click="loadData"/>
                <el-button v-if="show_clear" type="warning" icon="el-icon-delete" size="mini" @click="resetChecked">
                    清空选中
                </el-button>
            </div>
        </div>
        <RoleForm ref="form" :is-add="isAdd"/>
        <el-card style="width: 62%;float:left;margin-right: 20px;min-width: 500px;height: 83vh">
            <div slot="header" class="">
                <span>角色列表</span>
            </div>
            <el-table
                    ref="roleTable" :data="RoleList" style="width: 100%;margin-bottom: 20px;font-size: 12px"
                    row-key="name" v-loading="loading" @row-click="rowClick" highlight-current-row>
                <el-table-column prop="name" align="center" label="名称"/>
                <el-table-column prop="code" align="center" label="编码"/>
                <el-table-column prop="level" align="center" label="级别"/>
                <el-table-column prop="ct" align="center" label="创建时间">
                    <template slot-scope="scope">
                        <i class="el-icon-time"/>
                        <span style="margin-left: 10px">{{ new Date(scope.row.ct).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        align="center"
                        label="操作">
                    <template slot-scope="scope">
                        <el-button
                                v-if="getShow(scope.row.level)&&rights('ROLE_UPDATE')"
                                @click.native.prevent="editRow(scope.row)"
                                type="primary" icon="el-icon-edit" size="mini">
                        </el-button>
                        <el-button
                                v-if="getShow(scope.row.level)&&rights('ROLE_DEL')"
                                @click.native.prevent="deleteRow(scope.row)"
                                type="danger"
                                icon="el-icon-delete"
                                size="mini">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-card style="width: 35%;min-width: 100px;height: 83vh;overflow: auto">
            <div slot="header">
                <span>权限列表</span>
                <el-button style="float: right;" size="small" type="primary" @click="getChkNode"
                           v-if="rights('ROLE_ACCESS')">保存修改
                </el-button>
            </div>
            <el-collapse v-model="activePanels" style="height: 100%">
                <el-collapse-item title="菜单权限" name="1">
                    <el-tree
                            :props="menuProps"
                            :data="MenuTree"
                            accordion
                            ref="menus"
                            node-key="id"
                            expand-on-click-node
                            :render-after-expand="false"
                            @check-change="checkSetPermitChk"
                            show-checkbox>
                    </el-tree>
                </el-collapse-item>
                <el-collapse-item title="功能权限" name="2">
                    <el-tree
                            :props="accessProps"
                            :data="PermitTree"
                            accordion
                            check-on-click-node
                            node-key="id"
                            ref="permits"
                            :render-after-expand="false"
                            @check-change="checkPermitChk"
                            show-checkbox>
                    </el-tree>
                </el-collapse-item>
                <el-collapse-item title="命令权限" name="3">
                    <el-transfer size="mini" :titles="['Source', 'Target']" filterable v-model="selectCmd"
                                 :data="commandList"/>
                </el-collapse-item>
            </el-collapse>
        </el-card>
    </div>

</template>

<script>
    import {
        delete_role,
        get_commands,
        get_roles,
        query_roles,
        update_role_commands,
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
                PermitTree: [],
                commandList: [],
                selectCmd: [],
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
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            getShow(level) {
                if (this.$store.getters.roles.indexOf("ROLE_DEV") !== -1) {
                    return true;
                }
                return level >= 2;
            }, loadQuery() {
                if (this.query.blurry === '') {
                    this.loadData();
                    return;
                }
                this.RoleList = [];
                this.resetChecked();
                this.select_key = '';
                this.loading = true;
                query_roles(this.query).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.RoleList = resp.data.message;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                })
            },
            loadData() {
                if (!this.rights("ROLE_QUERY") || !this.rights("MENU_QUERY") ||
                    !this.rights("RIGHTS_QUERY") || !this.rights("ROLE_COMMANDS")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                    return;
                }
                this.loading = true;
                this.clearData();
                Promise.all([get_roles(), get_menu_tree(), get_permits(), get_commands()])
                    .then(([roles, menus, permits, commands]) => {
                        this.RoleList = roles.data.message;
                        this.MenuTree = menus.data.message;
                        this.commandList = commands.data.message;
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
                this.$refs.menus.setCheckedKeys([]);
                this.$refs.permits.setCheckedKeys([]);
                this.select_key = row.id;
                this.setRolePermit(row, this.setRoleMenu(row));
                this.setCommandsSelect(row);
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
                        } else if (menus[i].pid === 0 && menus[i].component !== 'Index') {
                            defaultMenu.push(menus[i].id);
                        }
                    }
                }
                if (defaultMenu.length === 0) {
                    this.$refs.menus.setCheckedKeys([]);
                } else {
                    defaultMenu.forEach(key => {
                        this.$refs.menus.setChecked(key, true, false);
                    });
                }
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
            }, setCommandsSelect(row) {
                if (row.commands) {
                    this.selectCmd = row.commands.commands.split(",");
                } else {
                    this.selectCmd = [];
                }
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
                if (Object.prototype.hasOwnProperty.call(data,['menu']) && chk && menus_chk.indexOf(data.menu.id) === -1) {
                    this.$refs.permits.setChecked(data, false, true)
                }
                if (!Object.prototype.hasOwnProperty.call(data,["menu"]) && chk && menus_chk.indexOf(data.id) === -1) {
                    this.$refs.permits.setChecked(data, false, true)
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
                let cmd = {
                    commands: this.selectCmd.join(",")
                };
                let form = {
                    id: this.select_key,
                    name: 'update',
                    code: 'update',
                    menuSet: menus,
                    permissionSet: permits,
                    commands: cmd
                };
                this.loading = true;
                Promise.all([update_role_menus(form), update_role_permits(form), update_role_commands(form)]).then(() => {
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
                this.selectCmd = [];
                this.select_key = '';
            }
        }
    }
</script>
<style scoped>
    /deep/ .el-transfer__buttons {
        padding: 0 10px;
    }

    /deep/ .el-transfer__button {
        padding: 10px 10px;
    }
</style>
