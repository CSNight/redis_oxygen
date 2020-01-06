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
        </el-table>
    </div>

</template>

<script>

    import {insScanKey} from "../../../api/redismanage/redis_dba";

    export default {
        name: "KeyTable",
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
