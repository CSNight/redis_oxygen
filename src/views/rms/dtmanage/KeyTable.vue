<template>
    <div style="height:100%;padding:10px">
        <el-table :data="keyDt"
                  height="50%"
                  style="width: 100%;margin-bottom: 20px;"
                  row-key="name"
                  v-loading="loading">
            <el-table-column prop="id" width="80" align="center" label="id"/>
            <el-table-column prop="key" sortable align="center" label="键"/>
            <el-table-column prop="type" width="120" align="center" label="类型">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="getTagType(scope.row.type)">{{scope.row.type}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="size" width="150" align="center" label="长度"/>
            <el-table-column prop="ttl" width="150" sortable align="center" label="过期时间"/>
            <el-table-column align="center" label="操作" width="200px">
                <template slot-scope="scope">
                    <el-button
                            @click="viewKey(scope.row)"
                            type="text"
                            size="small">查看
                    </el-button>
                    <el-button
                            @click="deleteKey(scope.row)"
                            type="text"
                            size="small">删除
                    </el-button>
                </template>
            </el-table-column>
            <infinite-loading
                    slot="append" spinner="bubbles"
                    @infinite="infiniteHandler"
                    force-use-infinite-wrapper=".el-table__body-wrapper">
            </infinite-loading>
        </el-table>
    </div>

</template>

<script>

    import {insScanKey} from "../../../api/redismanage/redis_dba";
    import InfiniteLoading from 'vue-infinite-loading';

    export default {
        name: "KeyTable",
        components: {InfiniteLoading},
        props: {
            total: {
                type: Number,
                required: true
            }, db: {
                type: Number,
                required: true
            }, ins: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: false,
                keyDt: [], cur: 1, cursor: '0', match: '*',
            }
        }, methods: {
            getTagType(type) {
                switch (type) {
                    default:
                    case"string":
                        return "primary";
                    case"list":
                        return "success";
                    case"set":
                        return "warning";
                    case"zset":
                        return "danger";
                    case"hash":
                        return "info";
                }
            },
            infiniteHandler($state) {
                this.loadBatch($state);
            }, loadBatch(inf) {
                insScanKey({
                    cursor: this.cursor,
                    match: this.match,
                    count: 1000,
                    db: this.db,
                    ins_id: this.ins,
                }).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        let nks = resp.data.message.keys;
                        for (let i = 0; i < nks.length; i++) {
                            nks[i]['id'] = this.keyDt.length + 1;
                            this.keyDt.push(nks[i]);
                        }
                        this.cursor = resp.data.message.cursor;
                        if (this.cursor === '0') {
                            inf.complete();
                        }
                    }
                    if (inf) {
                        inf.loaded();
                    }
                }).catch(() => {
                    if (inf) {
                        inf.error();
                    }
                });
            }, viewKey(row) {

            }, deleteKey(row) {

            }
        }
    }
</script>

<style scoped>
    /deep/ .el-table td, /deep/ .el-table th {
        padding: 5px 0;
    }
</style>
