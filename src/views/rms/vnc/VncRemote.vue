<template>
    <el-button @click="init"></el-button>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "VncRemote",
        computed: {
            ...mapGetters([
                'client',
                'events',
            ])
        },
        created() {
        }, methods: {
            init() {
                this.events.on("sss", this.handler);
                this.client.connect();
            },
            handler() {
            }
        }, beforeDestroy() {

        }
    }
</script>

<style scoped>

</style>