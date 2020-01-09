<template>
    <el-row v-if="key.hasOwnProperty('type')">
        <el-col :span="16">
            <el-divider content-position="center">键值</el-divider>
            <div style="height: 30vh">
                <el-input placeholder="请输入内容" v-model="key.key" readonly size="mini">
                    <template slot="prepend"><i class="el-icon-key"/>键</template>
                </el-input>
                <el-input type="textarea" v-model="key.val" class="value-win" resize="none"/>
            </div>
        </el-col>
        <el-col :span="7" style="margin-left: 10px;height:100%">
            <el-divider content-position="center">监控任务</el-divider>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: "ValueViewer",
        props: {
            db: {
                type: Number,
                required: true
            }, ins: {
                type: String,
                required: true
            }
        }, data() {
            return {
                key: {}
            }
        }, beforeDestroy() {
            this.$wss.un("msgRev", this.appId);
            this.$wss.close();
        }
    }
</script>

<style scoped>
    .value-win {
        height: 230px;
        overflow: auto;
        margin-top: 10px;
    }

    /deep/ .el-textarea__inner {
        height: 230px;
    }
</style>