<template>
    <div>
        <el-table
                :data="tableData"
                style="width: 100%;margin-bottom: 20px;"
                row-key="name"
                border
                :stripe="true"
                default-expand-all
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column
                    prop="id"
                    label="编号"
                    sortable>
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="名称"
                    align="center"
                    sortable>
            </el-table-column>
            <el-table-column
                    prop="enabled"
                    align="center"
                    label="状态">
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
                            @click.native.prevent="editRow(scope.row, tableData)"
                            type="primary"
                            icon="el-icon-edit"
                            size="small">
                    </el-button>
                    <el-button
                            v-if="getShow(scope.$index)"
                            @click.native.prevent="deleteRow(scope.row, tableData)"
                            type="danger"
                            icon="el-icon-delete"
                            size="small">
                    </el-button>
                    <el-button
                            v-if="getShow(scope.$index)"
                            @click.native.prevent="editRow(scope.row, tableData)"
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
    import get_org_tree from '../../api/user/org_api'

    export default {
        data() {
            return {
                tableData: [],
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
                this.tableData = [];
                get_org_tree().then((resp) => {
                    this.tableData.push(resp.data.message)
                })
            },
            deleteRow(index, rows) {
                rows.splice(index, 1);
            },
            editRow(row, data) {

            }
        }
    }
</script>