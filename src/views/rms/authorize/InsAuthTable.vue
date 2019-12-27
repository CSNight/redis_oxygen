<template>
    <div>
        <div class="head-container">
        </div>
        <div style="height:85vh;box-shadow:0 2px 12px 0 rgba(0,0,0,0.1);margin-left: 10px;padding:10px">
            <el-table
                    :data="authorities"
                    style="width: 100%;margin-bottom: 20px;"
                    v-loading="loading">
                <el-table-column prop="instance_name" align="center" label="名称"/>
                <el-table-column prop="state" align="center" label="状态">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="scope.row.state ? 'success' : 'danger'">
                            {{scope.row.state?'在线':'断开'}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="authorize" align="center" label="授权用户"/>
                <el-table-column prop="ct" align="center" label="创建时间">
                    <template slot-scope="scope">
                        <i class="el-icon-time"/>
                        <span style="margin-left: 10px">{{  dateFormat("YYYY-mm-dd HH:MM:SS",new Date(scope.row.ct)) }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
    import {dateFormat} from "../../../utils/utils";
    import {getAllAuthorizes, getAuthorizesByUser, queryBy} from "../../../api/redismanage/redis_auth";

    export default {
        name: "InsAuthTable",
        data() {
            return {
                loading: false,
                authorities: []
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData();
            })
        },
        methods: {
            dateFormat(fmt, dt) {
                return dateFormat(fmt, dt);
            }, rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadData() {
                if (!this.rights("AUTH_QUERY_ALL") && !this.rights("AUTH_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("AUTH_QUERY_ALL")) {
                    this.loading = true;
                    this.authorities = [];
                    this.loadAll();
                } else {
                    this.loadByUser();
                }
            }, loadByUser() {
                getAuthorizesByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.authorities = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadAll() {
                getAllAuthorizes().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.authorities = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, loadQuery() {
                this.loading = true;
                if (this.query.blurry === '') {
                    this.loadData('true');
                    return;
                }
                this.authorities = [];
                queryBy(this.query).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.authorities = resp.data.message;
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                })
            },
        }
    }
</script>

<style scoped>

</style>