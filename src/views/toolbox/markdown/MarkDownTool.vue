<template>
    <el-card style="height: 86vh;width: 100%;margin-top: 20px;">
        <div slot="header">Markdown - support by <a style="text-decoration: underline;color:#2bf" href="https://github.com/hinesboy/mavonEditor">MavonEditor</a></div>
        <mavonEditor style=" height: 80vh; width: 100%;"/>
    </el-card>
</template>

<script>
    import {mavonEditor} from 'mavon-editor'
    import 'mavon-editor/dist/css/index.css'

    export default {
        name: "MarkDownTool", components: {
            mavonEditor
        }
    }
</script>

<style scoped>
    /deep/ .el-card__body {
        padding: 0;
    }
</style>