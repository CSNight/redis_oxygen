<template>
    <el-card style="margin-top: 20px">
        <div slot="header">邮件工具</div>
        <el-tabs style="width:100%;height: 75vh;">
            <el-tab-pane label="邮件设置" name="first">邮件设置</el-tab-pane>
            <el-tab-pane label="发送邮件" name="second">发送邮件</el-tab-pane>
            <el-tab-pane label="配置管理" name="third">配置管理</el-tab-pane>
        </el-tabs>
    </el-card>

</template>

<script>
    export default {
        name: "EmailTool",
        data(){
            return{

            }
        },created(){
            this.$nextTick(()=>{
                console.log("dssad");
            })
        }
    }
</script>

<style scoped>

</style>