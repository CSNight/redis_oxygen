<template>
    <div>
        <el-button @click="init"></el-button>
        <el-button @click="send"></el-button>
    </div>

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