<template>
    <textarea class="console" style=""/>
</template>

<script>
    export default {
        name: "CmdConsole"
    }
</script>

<style scoped>
    .console {
        width: 100%;
        height: 100%;
        margin: 0 0 20px 0 !important;
        padding: 10px;
        border: none;

        ::-webkit-scrollbar {
            overflow-x: hidden;
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        /deep/ ::-webkit-scrollbar-thumb {
            background-color: #ddd;
            border-radius: 3px;
        }
    }


</style>