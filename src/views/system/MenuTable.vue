<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.name" placeholder="输入菜单名称搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-select v-model="query.enabled" clearable placeholder="状态" class="filter-item" style="width: 90px"
                       size="mini" value="">
                <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name"
                           :value="item.key"/>
            </el-select>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button
                        @click.native.prevent="new_menu"
                        class="filter-item"
                        size="mini"
                        type="primary"
                        icon="el-icon-plus"
                >新增
                </el-button>
                <el-button
                        @click.native.prevent="loadData"
                        type="success"
                        icon="el-icon-refresh"
                        size="mini">
                </el-button>
            </div>
        </div>
        <MenuForm ref="form" :status="status" :is-add="isAdd"/>
        <el-divider content-position="left"></el-divider>
        <el-table
                :data="MenuTree"
                style="width: 100%;margin-bottom: 20px;"
                row-key="name"
                v-loading="loading"
                border
                :stripe="true"
                default-expand-all
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column
                    prop="name"
                    label="名称">
            </el-table-column>
            <el-table-column prop="icon" label="图标" align="center" width="100px">
                <template slot-scope="scope">
                    <fa-icon :icon-class="scope.row.icon" :class-name="className"></fa-icon>
                </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" align="center" width="100px">
                <template slot-scope="scope">
                    <el-tag type="primary">{{scope.row.sort}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    prop="enabled"
                    align="center"
                    label="状态"
                    width="100px">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.hidden ? 'danger' : 'success'">{{scope.row.hidden?'隐藏':'显示'}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    prop="path"
                    align="center"
                    label="链接"
                    width="100px">
                <template slot-scope="scope">
                    <el-tag type="primary">{{scope.row.iframe?'是':'否'}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    prop="component"
                    align="center"
                    label="组件">
            </el-table-column>
            <el-table-column
                    prop="component_name"
                    align="center"
                    label="组件编码">
            </el-table-column>
            <el-table-column
                    prop="path"
                    align="center"
                    label="路由">
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
                            @click.native.prevent=""
                            type="primary"
                            icon="el-icon-edit"
                            size="small">
                    </el-button>
                    <el-button
                            @click.native.prevent="deleteRow(scope.row) "
                            type="danger"
                            icon="el-icon-delete"
                            size="small">
                    </el-button>
                    <el-button
                            @click.native.prevent="viewToggle(scope.row)"
                            :type="visBtnType(scope.row)"
                            :icon="visBtnIcon(scope.row)"
                            size="small">
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {delete_menu, get_menu_tree, modify_menu} from "@/api/system/menu_api";
    import MenuForm from './MenuForm'

    export default {
        name: "MenuTable",
        components: {MenuForm},
        data() {
            return {
                enabledTypeOptions: [
                    {key: 'true', display_name: '显示'},
                    {key: 'false', display_name: '隐藏'}
                ],
                query: {
                    name: '',
                    enabled: ''
                },
                MenuTree: [],
                loading: false,
                isAdd: true,
                className: 'fa-1x',
                status: [{id: 1, value: true, label: '隐藏'}, {id: 2, value: false, label: '显示'}],
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            });
        }, methods: {
            visBtnIcon(row) {
                return row.hidden ? 'fa fa-eye' : 'fa fa-eye-slash'
            },
            visBtnType(row) {
                return row.hidden ? 'success' : 'warning'
            },
            loadData() {
                this.loading = true;
                this.MenuTree = [];
                get_menu_tree().then((resp) => {
                    this.MenuTree = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            }, new_menu() {
                this.isAdd = true;
                const _this = this.$refs.form;
                _this.MenuTree = this.MenuTree;
                _this.dialog = true
            }, deleteRow(row) {
                this.$confirm('此操作将该菜单及子菜单将一起删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    delete_menu(row.id).then((resp) => {
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
            }, viewToggle(row) {
                let menu_ins = Object.assign({}, row);
                let msg_prefix = row.hidden ? '显示' : '隐藏';
                menu_ins.hidden = !row.hidden;
                let tit = '此操作将该菜单及子菜单将一起' + msg_prefix + ', 是否继续?';
                this.$confirm(tit, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    modify_menu(menu_ins).then((resp) => {
                        if (resp.data.status === 200 && resp.data.hasOwnProperty('message')) {
                            this.$message({
                                type: 'success',
                                message: '状态切换成功!'
                            });
                        } else {
                            this.$message.error('状态切换失败!');
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

<style scoped>
    .head-container {
        height: 30px;
    }

    .filter-item {
        margin: 10px 7px;
    }
</style>