<template>
    <div>
        <el-table
                :data="tableData"
                style="width: 100%;margin-bottom: 20px;"
                row-key="id"
                border
                default-expand-all
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column
                    prop="id"
                    label="日期"
                    sortable
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="姓名"
                    sortable
                    width="180">
            </el-table-column>
            <el-table-column
                    prop="pid"
                    label="地址">
            </el-table-column>
            <el-table-column
                    fixed="right"
                    label="操作"
                    width="120">
                <template slot-scope="scope">
                    <el-button
                            v-if="getShow(scope.$index)"
                            @click.native.prevent="deleteRow(scope.$index, tableData)"
                            type="danger"
                            size="small">
                        移除
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
            loadData() {
                this.tableData = [];
                get_org_tree().then((resp) => {
                    this.tableData.push(resp.data.message)
                })
            },
            deleteRow(index, rows) {
                rows.splice(index, 1);
            }
        }
    }
</script>