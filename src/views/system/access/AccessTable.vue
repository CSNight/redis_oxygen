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
        <el-divider content-position="left"></el-divider>
        <el-table
                :data="[]"
                style="width: 100%;margin-bottom: 20px;"
                row-key="name"
                v-loading="loading"
                :stripe="true"
                default-expand-all>
            <el-table-column
                    prop="description"
                    label="名称">
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="编码">
            </el-table-column>
            <el-table-column
                    prop="component"
                    label="组件">
            </el-table-column>
            <el-table-column
                    prop="isControl"
                    label="是否">
            </el-table-column>
            <el-table-column
                    prop="create_time"
                    label="编码">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        name: "AccessTable",
        data() {
            return {
                loading: false,
                query: {
                    name: ''
                },
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