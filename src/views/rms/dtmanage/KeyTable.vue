<template>
    <div style="height:100%">
        <el-table :data="keyDt"
                  height="250"
                  style="width: 100%;margin-bottom: 20px;"
                  row-key="name"
                  v-loading="loading"
                  :stripe="true">
            <el-table-column prop="key" align="center" label="键"/>
            <el-table-column prop="type" align="center" label="类型"/>
            <el-table-column prop="size" align="center" label="长度"/>
            <el-table-column prop="ttl" align="center" label="过期时间"/>
            <infinite-loading
                    slot="append"
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
        components:{InfiniteLoading},
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
            infiniteHandler($state) {
                this.keyDt.push({
                    key: '2016-05-07',
                    type: '王小虎',
                    size: '上海市普陀区金沙江路 1518 弄',
                    ttl: 1
                });
                $state.loaded();
            },
            pageChange(e) {
                console.log("cur" + this.cur, e);
                if (e > this.cur) {

                }
                insScanKey({
                    cursor: this.cursor,
                    match: this.match,
                    count: 100,
                    db: this.db,
                    ins_id: this.ins,
                }).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.keyDt = this.keyDt.concat(resp.data.message.keys);
                        this.cursor = resp.data.message.cursor;
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>
