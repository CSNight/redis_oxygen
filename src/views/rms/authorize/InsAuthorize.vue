<template>
    <el-row>
        <el-col :span="5">
            <div class="head-container">
                <el-input class="filter-item" style="width:70%;height: 30px;" v-if="rights('INS_SEARCH')"
                          clearable v-model="query.blurry" size="mini" placeholder="输入名称进行过滤" @change="loadQuery"/>
            </div>
            <el-card style="height:85vh">
                <div slot="header">
                    <span>实例列表</span>
                </div>
                <el-tree class="filter-tree" :data="instances" default-expand-all :props="{label: 'instance_name'}"
                         ref="tree">
                        <span class="custom-tree-node" slot-scope="{ node}">
                            <span>{{ node.label }}</span>
                        </span>
                </el-tree>
            </el-card>
        </el-col>
        <el-col :span="19">
            <ins-auth-table ref="authTable"/>
        </el-col>
    </el-row>
</template>

<script>
    import {getAll, getByUser, queryBy} from "../../../api/redismanage/redis_ins";
    import InsAuthTable from "./InsAuthTable";

    export default {
        name: "InsAuthorize",
        components: {InsAuthTable},
        data() {
            return {
                query: {blurry: ''},
                loading: false,
                instances: [],
                identify: this.$store.getters.identify,
            }
        }, created() {
            this.$nextTick(() => {
                this.loadData('false');
            })
        }, methods: {
            rights(permit) {
                if (this.$store.getters.permit.hasOwnProperty(permit)) {
                    return this.$store.getters.permit[permit];
                }
                return false
            }, loadData(update) {
                if (!this.rights("INS_QUERY_ALL") && !this.rights("INS_QUERY")) {
                    this.$message.error({
                        message: "禁止查询!"
                    });
                } else if (this.rights("INS_QUERY_ALL")) {
                    this.loading = true;
                    this.instances = [];
                    this.loadAll(update);
                } else {
                    this.loadByUser();
                }
            }, loadByUser() {
                getByUser(this.identify).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
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
            }, loadAll(update) {
                getAll(update).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
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
                this.instances = [];
                queryBy(this.query).then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.instances = resp.data.message;
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
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
</style>