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
        <el-card style="width: 66%;float:left;margin-right: 20px;min-width: 500px;height: 85vh">
            <div slot="header" class="">
                <span>角色列表</span>
            </div>
            <el-table
                    :data="RoleList"
                    style="width: 100%;margin-bottom: 20px;font-size: 12px"
                    row-key="name"
                    v-loading="loading"
                    :stripe="true">
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
                                @click.native.prevent="editRow(scope.row)"
                                type="primary"
                                icon="el-icon-edit"
                                size="small">
                        </el-button>
                        <el-button
                                @click.native.prevent="deleteRow(scope.row)"
                                type="danger"
                                icon="el-icon-delete"
                                size="small">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-card style="width: 30%;min-width: 100px;height: 85vh">
            <div slot="header" class="">
                <span>权限列表</span>
                <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
            </div>
            <el-tree
                    :data="[]"
                    show-checkbox
                    node-key="id"
                    :default-expanded-keys="[2, 3]"
                    :default-checked-keys="[5]"
                    :props="defaultProps">
            </el-tree>

        </el-card>
    </div>

</template>

<script>
    import {get_roles} from "@/api/system/role_api";

    export default {
        name: "RoleTable",
        data() {
            return {
                loading: false,
                query: {
                    name: ''
                }, defaultProps: {
                    children: 'children',
                    label: 'label'
                }, RoleList: []
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            });
        }, methods: {
            loadData() {
                this.loading = true;
                this.RoleList = [];
                get_roles().then((resp) => {
                    this.RoleList = resp.data.message;
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                });
            },
            editRow(row) {
                return row;
            }, deleteRow(row) {
                return row;
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