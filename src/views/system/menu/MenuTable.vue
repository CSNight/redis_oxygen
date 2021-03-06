<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input v-if="rights('MENU_QUERY')" clearable v-model="query.name" placeholder="输入菜单名称搜索"
                      style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-select v-if="rights('MENU_QUERY')" v-model="query.hidden" clearable placeholder="状态" class="filter-item"
                       style="width: 90px"
                       size="mini" value="" @change="loadQuery">
                <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name"
                           :value="item.key"/>
            </el-select>
            <el-button class="filter-item" size="mini" type="success" @click="loadQuery" icon="el-icon-search"
                       v-if="rights('MENU_QUERY')">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button @click.native.prevent="new_menu" class="filter-item" size="mini" type="primary"
                           v-if="rights('MENU_ADD')"
                           icon="el-icon-plus">新增
                </el-button>
                <el-button
                        @click.native.prevent="refreshSide" type="warning" icon="fa fa-repeat" size="mini"
                        v-if="rights('MENU_ADD')">左侧导航刷新
                </el-button>
                <el-button
                        v-if="rights('MENU_QUERY')" @click.native.prevent="loadData" type="danger"
                        icon="el-icon-refresh" size="mini">
                </el-button>
            </div>
        </div>
        <MenuForm ref="form" :status="status" :is-add="isAdd" :icons="icons"/>
        <el-scrollbar style="height: 100%">
            <el-table
                    :data="MenuTree"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="name"
                    v-loading="loading"
                    border
                    :stripe="true"
                    default-expand-all
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column prop="name" label="名称"/>
                <el-table-column prop="icon" label="图标" align="center" width="100px">
                    <template slot-scope="scope">
                        <fa-icon v-if="scope.row.icon.indexOf('fa-')!==-1" :icon-class="scope.row.icon"
                                 :class-name="className"/>
                        <svg-icon v-if="scope.row.icon.indexOf('svg-')!==-1" :icon-class="scope.row.icon"
                                  :class-name="className"/>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" align="center" width="100px">
                    <template slot-scope="scope">
                        <el-tag size="small" type="primary">{{scope.row.sort}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="enabled" align="center" label="状态" width="100px">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="scope.row.hidden ? 'danger' : 'success'">
                            {{scope.row.hidden?'隐藏':'显示'}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="iframe" align="center" label="链接" width="100px">
                    <template slot-scope="scope">
                        <el-tag size="small" type="primary">{{scope.row.iframe?'是':'否'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="component" align="center" label="组件"/>
                <el-table-column prop="component_name" align="center" label="组件编码"/>
                <el-table-column prop="path" align="center" label="路由"/>
                <el-table-column prop="create_time" align="center" label="创建时间">
                    <template slot-scope="scope">
                        <i class="el-icon-time"/>
                        <span style="margin-left: 10px">{{ new Date(scope.row.create_time).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="200px">
                    <template slot-scope="scope">
                        <el-button
                                v-if="rights('MENU_UPDATE')"
                                @click.native.prevent="editRow(scope.row)"
                                type="primary"
                                icon="el-icon-edit"
                                size="mini">
                        </el-button>
                        <el-button
                                v-if="rights('MENU_DEL')"
                                @click.native.prevent="deleteRow(scope.row) "
                                type="danger"
                                icon="el-icon-delete"
                                size="mini">
                        </el-button>
                        <el-button
                                v-if="rights('MENU_UPDATE')"
                                @click.native.prevent="viewToggle(scope.row)"
                                :type="visBtnType(scope.row)"
                                :icon="visBtnIcon(scope.row)"
                                size="mini">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
    </div>
</template>

<script>
    import {delete_menu, get_icons, get_menu_tree, modify_menu, query_by} from "../../../api/system/menu_api";
    import MenuForm from './MenuForm'

    export default {
        name: "MenuTable",
        components: {MenuForm},
        data() {
            return {
                enabledTypeOptions: [
                    {key: 'true', display_name: '隐藏'},
                    {key: 'false', display_name: '显示'}
                ],
                query: {
                    name: '',
                    hidden: ''
                },
                icons: [],
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
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            visBtnIcon(row) {
                return row.hidden ? 'fa fa-eye' : 'fa fa-eye-slash'
            },
            visBtnType(row) {
                return row.hidden ? 'success' : 'warning'
            },
            loadData() {
                if (!this.rights("MENU_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                    return;
                }
                this.loading = true;
                this.MenuTree = [];
                this.icons = [];
                Promise.all([get_menu_tree(), get_icons()]).then(([tr, ti]) => {
                    this.icons = ti.data.message;
                    this.MenuTree = tr.data.message;
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadQuery() {
                if (this.query.name === '' && this.query.hidden === '') {
                    this.loadData();
                    return;
                }
                this.loading = true;
                let params = {name: this.query.name};
                if (this.query.hidden !== '') {
                    params['hidden'] = this.query.hidden === 'true';
                }
                this.MenuTree = [];
                query_by(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.MenuTree = resp.data.message;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            }, new_menu() {
                this.isAdd = true;
                const _this = this.$refs.form;
                let tmpTree = JSON.parse(JSON.stringify(this.MenuTree));
                _this.MenuTree = [{
                    id: 0,
                    pid: -1,
                    name: '顶级菜单',
                    component: '',
                    component_name: '',
                    path: '/',
                    sort: 0,
                    hidden: true,
                    children: tmpTree
                }];
                _this.dialog = true
            }, editRow(row) {
                this.isAdd = false;
                const _this = this.$refs.form;
                let tmpTree = JSON.parse(JSON.stringify(this.MenuTree));
                _this.MenuTree = [{
                    id: 0,
                    pid: -1,
                    name: '顶级菜单',
                    component: '',
                    component_name: '',
                    path: '/',
                    sort: 0,
                    hidden: true,
                    children: tmpTree
                }];
                _this.form = JSON.parse(JSON.stringify(row));
                _this.dialog = true;
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
                        if (resp.data.status === 200 && Object.prototype.hasOwnProperty.call(resp.data,['message'])) {
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
            }, unlockLoading() {
                this.loadBg.close();
            }, refreshSide() {
                location.reload();
            }
        }
    }
</script>
