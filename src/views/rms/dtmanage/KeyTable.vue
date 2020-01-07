<template>
    <el-card style="height:100%;margin-left: 10px">
        <div slot="header">
            <span>数据列表</span>
        </div>
        <el-table :data="keyDt"
                  height="50%"
                  style="width: 100%;margin-bottom: 20px;min-height: 40vh"
                  row-key="name"
                  v-loading="loading">
            <el-table-column align="center" type="selection" width="55"/>
            <el-table-column prop="id" width="80" align="center" label="id"/>
            <el-table-column prop="key" sortable align="center" label="键"/>
            <el-table-column prop="type" width="120" align="center" label="类型"
                             :filters="filters"
                             :filter-method="filterHandler">
                <template slot-scope="scope">
                    <el-tag size="mini" :type="getTagType(scope.row.type)">{{scope.row.type}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="size" width="150" align="center" label="长度"/>
            <el-table-column prop="ttl" width="150" sortable align="center" label="过期时间"/>
            <el-table-column align="center" label="操作" width="200px">
                <template slot-scope="scope">
                    <el-button
                            v-if="rights('')"
                            @click="setNx(scope.row)"
                            type="text"
                            size="small">NX
                    </el-button>
                    <el-button
                            v-if="rights('KEYS_KEY_VAL')"
                            @click="viewKey(scope.row)"
                            type="text"
                            size="small">查看
                    </el-button>
                    <el-button
                            v-if="rights('KEYS_KEY_DELETE')"
                            @click="deleteKey(scope.row)"
                            type="text"
                            size="small">删除
                    </el-button>
                </template>
            </el-table-column>
            <infinite-loading ref="loader"
                              slot="append" spinner="bubbles"
                              @infinite="infiniteHandler"
                              force-use-infinite-wrapper=".el-table__body-wrapper">
            </infinite-loading>
        </el-table>
    </el-card>
</template>

<script>

    import {deleteKey, getKeyValue, insScanKey} from "../../../api/redismanage/redis_keys";
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
            }, match: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                loading: false,
                keyDt: [], cur: 1, cursor: '0',
                filters: [
                    {text: "String", value: "string"},
                    {text: "Set", value: "Set"},
                    {text: "List", value: "List"},
                    {text: "ZSet", value: "zset"},
                    {text: "Hash", value: "hash"}]
            }
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
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
                    match: this.match + "*",
                    count: 100,
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
                let params = {
                    db: this.db,
                    ins_id: this.ins,
                    keyName: row.key,
                    ttl: row.ttl,
                    type: row.type
                };
                getKeyValue(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        // eslint-disable-next-line no-console
                        console.log(resp.data.message[row.key])
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                })
            }, deleteKey(row) {
                let params = {
                    db: this.db,
                    ins_id: this.ins,
                    keyName: row.key,
                    keys: [row.key],
                    ttl: row.ttl,
                    type: row.type
                };
                deleteKey(params).then((resp) => {
                    if (resp.data.status === 200 && resp.data.message === "success") {
                        this.$message({
                            message: "删除成功!" + resp.data.message,
                            type: 'success'
                        });
                    } else {
                        this.$message.error({
                            message: "删除失败!" + resp.data.message
                        });
                    }
                }).catch((resp) => {
                    this.$message.error({
                        message: "删除失败!" + resp.data.message
                    });
                })
            }, setNx() {

            }, filterHandler(value, row, column) {
                const property = column['property'];
                return row[property] === value;
            }
        }
    }
</script>

<style scoped>
    /deep/ .el-table td, /deep/ .el-table th {
        padding: 5px 0;
    }
</style>
