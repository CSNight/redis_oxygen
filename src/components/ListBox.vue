<template>
    <el-row :style="width">
        <el-col :span="20">
            <el-table size="mini" :data="source" border :height="height" @selection-change="select"
                      highlight-current-row>
                <el-table-column
                        type="selection"
                        width="40">
                </el-table-column>
                <el-table-column v-for="(item, index) in this.cols" :key="index" :label="item.label" align="center"
                                 :prop="item.value">
                    <template slot-scope="scope">
                        <el-input size="mini" style=""
                                  v-model="source[scope.$index][scope.column.property]"/>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
        <el-col :style="'height:'+height+'px;border: 1px #eeeeee;border-style: solid solid solid none;'" :span="4">
            <el-button size="mini" style="width:100%;float:right;border: none" icon="el-icon-plus" @click="addRow"/>
            <el-button size="mini" style="width:100%;float:right;border: none" icon="el-icon-minus" @click="delRow"/>
            <el-button size="mini" style="width:100%;float:right;border: none" icon="el-icon-delete" @click="clearRow"/>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: "ListBox",
        props: {
            data: {
                type: Array,
                required: true
            },
            height: {
                type: Number,
                default: 200
            },
            col: {
                type: Array,
                default: function () {
                    return [{label: '列表项', value: "_"}];
                }
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData()
            })
        }, data() {
            return {
                source: [],
                cols: [],
                model: [],
                select_key: [],
                width: '400px'
            }
        }, watch: {
            source: {
                handler: function (val) {
                    if (val.length > 0 && this.$data.cols[0].value === '_') {
                        this.$data.model = [];
                        val.forEach(v => {
                            this.$data.model.push(v._);
                        })
                    } else if (val.length > 0 && this.$data.cols[0].value !== '_') {
                        this.$data.model = val;
                    } else {
                        this.$data.model = []
                    }
                },
                deep: true
            }
        }, methods: {
            loadData() {
                this.width = 'width:' + (this.$parent.$parent.$el.clientWidth - 120) + "px;";
                this.source = [];
                this.cols = this.col;
                if (this.col.length === 0) {
                    this.cols = [{label: '列表项', value: "_"}];
                }
                if (this.data.length > 0 && this.col.length > 0 && this.col[0].value === '_') {
                    if (this.data[0] instanceof Object) {
                        let keys = Object.keys(this.data[0]);
                        this.cols = [];
                        for (let i = 0; i < keys.length; i++) {
                            this.cols.push({label: keys[i], value: keys[i]})
                        }
                    }
                }
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i] instanceof Object) {
                        let item = JSON.parse(JSON.stringify(this.data[i]));
                        this.source.push(item);
                    } else {
                        let item = {};
                        item['_'] = this.data[i];
                        this.source.push(item);
                    }
                }
            },
            select(selection) {
                this.select_key = selection;
            },
            addRow() {
                let n = {};
                for (let i = 0; i < this.cols.length; i++) {
                    n[this.cols[i].value] = ''
                }
                this.source.push(n);
            }, delRow() {
                for (let i = 0; i < this.select_key.length; i++) {
                    this.source.splice(this.source.indexOf(this.select_key[i]), 1)
                }
            }, clearRow() {
                this.source = [];
            },
        }
    }
</script>

<style scoped>
    /deep/ .el-input__inner {
        border: none !important;
    }

    /deep/ ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    /deep/ ::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
    }
</style>