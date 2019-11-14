<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.name" placeholder="输入角色名称搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" size="mini" type="primary"
                           icon="el-icon-plus">新增
                </el-button>
                <el-button
                        type="danger" icon="el-icon-refresh" size="mini" @click="loadData">
                </el-button>
            </div>
        </div>
        <el-card style="width: 62%;float:left;margin-right: 20px;min-width: 500px;height: 85vh">
            <div slot="header" class="">
                <span>角色列表</span>
            </div>
            <el-table
                    :data="RoleList"
                    style="width: 100%;margin-bottom: 20px;font-size: 12px"
                    row-key="name"
                    v-loading="loading"
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
                <el-button style="float: right; padding: 3px 0" type="text" @click="getChkNode">操作按钮</el-button>
            </div>
            <el-collapse v-model="activePanels" style="height: 100%">
                <el-collapse-item title="菜单目录" name="1">
                    <el-tree
                            :props="menuProps"
                            :data="MenuTree"
                            accordion
                            ref="menus"
                            node-key="id"
                            show-checkbox>
                    </el-tree>
                </el-collapse-item>
                <el-collapse-item title="权限列表" name="2">
                    <el-tree
                            :props="accessProps"
                            :data="PermitTree"
                            accordion
                            node-key="id"
                            ref="permits"
                            show-checkbox>
                    </el-tree>
                </el-collapse-item>
            </el-collapse>
        </el-card>
    </div>

</template>

<script>
    import {get_roles} from "../../../api/system/role_api";
    import {get_menu_tree} from "../../../api/system/menu_api";
    import {get_permits} from "../../../api/system/access_api";

    export default {
        name: "RoleTable",
        data() {
            return {
                loading: false, activePanels: ["1", "2"],
                query: {
                    name: ''
                }, menuProps: {
                    children: 'children',
                    label: 'name'
                }, accessProps: {
                    children: 'children',
                    label: 'description'
                }, RoleList: [], MenuTree: [], PermitTree: []
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            });
        }, methods: {
            getShow(level) {
                return level >= 2;
            },
            loadData() {
                this.loading = true;
                this.RoleList = [];
                this.MenuTree = [];
                this.PermitTree = [];
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
                                    disabled: true,
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
                    this.loading = false
                });
            },
            editRow(row) {
                return row;
            }, deleteRow(row) {
                return row;
            }, getChkNode() {
                // eslint-disable-next-line no-console
                console.log(this.$refs.permits.getCheckedKeys(false, true));
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