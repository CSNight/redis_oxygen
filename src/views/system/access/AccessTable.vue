<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input v-if="rights('RIGHTS_QUERY')" clearable v-model="query.blurry" placeholder="输入菜单名称搜索"
                      style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search"
                       v-if="rights('RIGHTS_QUERY')" @click="loadQuery">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" size="mini" type="primary" @click="new_permit"
                           v-if="rights('RIGHTS_ADD')"
                           icon="el-icon-plus">新增
                </el-button>
                <el-button v-if="rights('RIGHTS_QUERY')"
                           type="danger" icon="el-icon-refresh" size="mini" @click="loadData">
                </el-button>
            </div>
        </div>
        <AccessForm ref="form" :is-add="isAdd"/>
        <el-divider content-position="left"/>
        <el-table
                :data="tableData.slice((currentPage-1)*pg_size,currentPage*pg_size)"
                style="width: 100%;margin-bottom: 20px;"
                row-key="name"
                v-loading="loading"
                :stripe="true"
                default-expand-all>
            <el-table-column prop="description" align="center" label="名称"/>
            <el-table-column prop="name" align="center" label="编码"/>
            <el-table-column prop="menu" align="center" label="组件">
                <template slot-scope="scope">
                    <el-tag size="small" type="primary">{{scope.row.menu.name}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_user" align="center" label="创建人"/>
            <el-table-column prop="create_time" align="center" label="创建时间">
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span style="margin-left: 10px">{{  dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.create_time)) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="200px">
                <template slot-scope="scope">
                    <el-button
                            v-if="rights('RIGHTS_UPDATE')"
                            @click.native.prevent="editRow(scope.row)"
                            type="primary"
                            icon="el-icon-edit"
                            size="small">
                    </el-button>
                    <el-button
                            v-if="rights('RIGHTS_DEL')"
                            @click.native.prevent="deleteRow(scope.row)"
                            type="danger"
                            icon="el-icon-delete"
                            size="small">
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[5,10]"
                :page-size="pg_size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="tableData.length"
                style="float: right">
        </el-pagination>
    </div>
</template>

<script>
    import {delete_permit, get_permits, query_permits} from "../../../api/system/access_api";
    import {get_menu_tree} from "../../../api/system/menu_api";
    import AccessForm from "./AccessForm";
    import {dateFormat} from "../../../utils/utils";

    export default {
        name: "AccessTable",
        components: {AccessForm},
        data() {
            return {
                loading: false, isAdd: true, pg_size: 10, currentPage: 1,
                query: {
                    blurry: ''
                }, tableData: [], MenuTree: []
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
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            },
            handleSizeChange: function (size) {
                this.pg_size = size;
            },
            handleCurrentChange: function (currentPage) {
                this.currentPage = currentPage;
            },
            loadData() {
                if (!this.rights("RIGHTS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                    return;
                }
                this.loading = true;
                this.tableData = [];
                this.MenuTree = [];
                get_permits().then((resp) => {
                    this.tableData = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                });
                get_menu_tree().then((resp) => {
                    this.MenuTree = resp.data.message;
                });
            }, loadQuery() {
                if (this.query.blurry === '') {
                    this.loadData();
                    return;
                }
                this.loading = true;
                this.tableData = [];
                query_permits(this.query).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.tableData = resp.data.message;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            }, new_permit() {
                this.isAdd = true;
                const _this = this.$refs.form;
                _this.menus = JSON.parse(JSON.stringify(this.MenuTree));
                _this.dialog = true
            }, deleteRow(row) {
                this.$confirm('将删除权限是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.lockLoading();
                    delete_permit(row.id).then((resp) => {
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
                _this.menus = JSON.parse(JSON.stringify(this.MenuTree));
                _this.form = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    create_time: row.create_time,
                    create_user: row.create_user,
                    menu: row.menu
                };
                _this.dialog = true;
            }, lockLoading() {
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

<style>

</style>