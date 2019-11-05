<template>
    <div>
        <el-table
                :data="tableData"
                style="width: 100%;margin-bottom: 20px;"
                row-key="name"
                v-loading="loading"
                border
                :stripe="true"
                default-expand-all
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column
                    prop="name"
                    label="名称"
                    align="center">
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
                    <el-tag :type="scope.row.enabled ? 'success' : 'danger'">{{scope.row.enabled?'启用':'禁用'}}</el-tag>
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
                    fixed="right"
                    align="center"
                    label="操作">
                <template slot-scope="scope">
                    <el-button
                            v-if="getShow(scope.$index)"
                            @click.native.prevent="editRow(scope.row)"
                            type="primary"
                            icon="el-icon-edit"
                            size="small">
                    </el-button>
                    <el-button
                            v-if="getShow(scope.$index)"
                            @click.native.prevent="deleteRow(scope.row)"
                            type="danger"
                            icon="el-icon-delete"
                            size="small">
                    </el-button>
                    <el-button
                            v-if="getShow(scope.$index)"
                            @click.native.prevent="editRow(scope.row)"
                            :type="lockBtnType(scope.row)"
                            :icon="lockBtnIcon(scope.row)"
                            size="small">
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {get_org_tree, delete_org} from '../../api/user/org_api'

    export default {
        data() {
            return {
                tableData: [],
                loading: true,
            }
        },
        created() {
            this.$nextTick(() => {
                this.loadData();
            })
        },
        computed: {},
        methods: {
            getShow: (index) => {
                return index !== 0
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
                })
            },
            // eslint-disable-next-line no-unused-vars
            deleteRow(row) {
                this.$confirm('此操作将该部门及子部门将一起删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delete_org(row.id).then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message.error('删除失败!');
                        }
                    });

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // eslint-disable-next-line no-unused-vars
            editRow(row, data) {

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