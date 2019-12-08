<template>
    <el-row>
        <el-col :span="4">
            <el-tree></el-tree>
        </el-col>
        <el-col :span="20">
            <el-tabs editable>
            </el-tabs>
        </el-col>
    </el-row>

</template>

<script>
    export default {
        name: "VncRemote",
        created() {
        }, methods: {
            init() {
                this.$wss.on("sss", this.handler);
                this.$wss.connect();
            },
            handler(data) {
                // eslint-disable-next-line no-console
                console.log(data)
            }, send() {
                this.$wss.send("sdada", "")
            }
        }, beforeDestroy() {

        }
    }
</script>

<style scoped>

</style>