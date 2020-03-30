<template>
    <div>
        <div class="head-container">
            <el-button v-if="rights('MAIL_CONF_ALL')" type="primary" icon="el-icon-refresh" size="mini"
                       @click="loadData()"/>
        </div>
        <el-table v-loading="loading" :data="confs">
            <el-table-column prop="protocol" align="center" label="协议"/>
            <el-table-column prop="host" align="center" label="服务器地址"/>
            <el-table-column prop="port" align="center" label="端口"/>
            <el-table-column prop="email" align="center" label="发件人"/>
            <el-table-column prop="username" align="center" label="用户名"/>
            <el-table-column prop="contact" align="center" label="常用联系人">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.contact!==''" effect="light" placement="top">
                        <div slot="content">
                            <a v-for="(item,i) in scope.row.contact.split(';')" :key="i">{{item}}<br></a>
                        </div>
                        <el-link type="danger">详情</el-link>
                    </el-tooltip>
                    <a v-if="scope.row.contact===''">无</a>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="250px">
                <template>
                    <el-button v-if="rights('MAIL_CONF_DEL')" type="danger" icon="el-icon-delete" size="mini"
                               @click="deleteById"/>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {delConf, getConfList} from "@/api/system/mail_api";

    export default {
        name: "MailConfs",
        data() {
            return {
                confs: [], loading: false
            }
        }, methods: {
            rights(permit) {
                if (Object.prototype.hasOwnProperty.call(this.$store.getters.permit, [permit])) {
                    return this.$store.getters.permit[permit];
                }
                return false
            },
            loadData() {
                getConfList().then((resp) => {
                    if (resp.data.status === 200 && resp.data.code === "OK") {
                        this.confs = resp.data.message;
                    } else {
                        this.$message.error({
                            message: "查询出错!" + resp.data.message
                        });
                    }
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!"
                    });
                });
            }, deleteById() {
                this.$confirm('将删除该条邮件配置, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    delConf().then((resp) => {
                        if (resp.data.status === 200 && resp.data.message === "success") {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '删除失败:' + resp.data.message
                            });
                        }
                        this.loadData();
                    }).catch(() => {
                        this.loadData();
                        this.$message.error({
                            message: "删除错误"
                        });
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                })
            }
        }
    }
</script>

<style scoped>

</style>