<template>
    <div>
        <!--工具栏-->
        <div class="head-container">
            <!-- 搜索 -->
            <el-input clearable v-model="query.name" placeholder="输入菜单名称搜索" style="width: 200px;" size="mini"
                      class="filter-item"/>
            <el-button class="filter-item" size="mini" type="success" icon="el-icon-search">搜索
            </el-button>
            <!-- 新增 -->
            <div style="display: inline-block;margin: 0 2px;">
                <el-button class="filter-item" size="mini" type="primary"
                           icon="el-icon-plus">新增
                </el-button>
                <el-button
                        type="danger" icon="el-icon-refresh" size="mini">
                </el-button>
            </div>
        </div>
        <el-card style="width: 66%;float:left;margin-right: 20px;min-width: 500px;">
            <div slot="header" class="">
                <span>角色列表</span>
            </div>
            <el-table
                    :data="[]"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="name"
                    v-loading="loading"
                    :stripe="true">
                <el-table-column
                        prop="name"
                        label="名称">
                </el-table-column>
                <el-table-column
                        prop="name"
                        label="编码">
                </el-table-column>
                <el-table-column
                        prop="create_time"
                        label="创建时间">
                </el-table-column>
                <el-table-column
                        fixed="right"
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
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-card style="width: 30%;min-width: 100px;">
            <div slot="header" class=" ">
                <span>权限列表</span>
                <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
            </div>
            <el-tree
                    :data="data"
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
                }
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