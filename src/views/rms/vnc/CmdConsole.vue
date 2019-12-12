<template>
    <el-input type="textarea" v-model="log" class="console" style=""/>
</template>

<script>
    export default {
        name: "CmdConsole",
        props: {
            prefix: {
                type: String,
                require: true,
            }
        }, data() {
            return {
                log: this.prefix + ''
            }
        }
    }
</script>

<style scoped>
    .console {
        width: 100%;
        margin: 0;
        padding: 10px;
        border: none;
        position: relative;
        height: calc(80vh - 20px);
    }

    textarea::-webkit-scrollbar {
        overflow-x: hidden;

    }

    /deep/ textarea::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    /deep/ textarea::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
    }

    /deep/ textarea {
        word-break: break-all;
        font-size: 0.32em;
        width: 100%;
        height: 100%;
        -webkit-appearance: none;
        border: none;
        resize: none;
        background-color: transparent;
        color: #2fb
    }


</style>