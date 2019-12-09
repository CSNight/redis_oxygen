<template>
    <div>
        <el-row>
            <el-col :span="4" style="height:auto;">
                <el-input
                        class="filter-item"
                        style="width:70%;height: 30px"
                        size="mini"
                        placeholder="输入名称进行过滤">
                </el-input>
            </el-col>
            <el-col :span="20" style="height:auto">
                <div class="head-container">
                    <el-button class="filter-item" size="mini" type="success"
                               icon="el-icon-search">搜索
                    </el-button>
                    <!-- 新增 -->
                    <div style="display: inline-block;margin: 0 2px;">
                        <el-button class="filter-item" size="mini"
                                   type="primary"
                                   icon="el-icon-plus">新增
                        </el-button>
                        <el-button type="danger" icon="el-icon-refresh" size="mini"
                        />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="4">
                <el-tree class="filter-tree" :data="instances" default-expand-all :props="{label: 'instance_name'}"
                         ref="tree"/>
            </el-col>
            <el-col :span="20">
                <el-tabs editable>
                </el-tabs>
            </el-col>
        </el-row>
    </div>


</template>

<script>
    import {getAll, getByUser} from "../../../api/redismanage/redis_ins";

    export default {
        name: "VncRemote",
        data() {
            return {
                loading: false, instances: [],
                identify: this.$store.getters.identify,
            }
        },
        created() {
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
            }
        }, beforeDestroy() {

        }
    }
</script>

<style scoped>

</style>