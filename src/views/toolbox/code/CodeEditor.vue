<template>
    <el-card style="margin-top: 20px">
        <div slot="header">
            <span>代码编辑</span>
            <div class="card-op">
                <span style="margin-right: 5px">Themes:</span>
                <el-select size="mini" v-model="theme">
                    <el-option v-for="item in themes" :key="item.theme" :label="item.caption" :value="item.name"/>
                </el-select>
            </div>
            <div class="card-op">
                <span style="margin-right: 5px">Languages:</span>
                <el-select size="mini" type="text" v-model="language" @change="langChange">
                    <el-option v-for="item in languages" :key="item.name" :label="item.caption" :value="item.name"/>
                </el-select>
            </div>
            <div class="card-op">
                <el-button v-if="language==='html'" type="primary" size="mini" @click="submit">运行</el-button>
                <el-button v-if="language==='json'" icon="fa fa-indent" size="mini" title="格式化"
                           @click="jsonFormat"/>
                <el-button v-if="language==='json'" icon="fa fa-archive" size="mini" title="压缩"
                           @click="jsonCompact"/>
            </div>
        </div>
        <div style="width:100%;height: 75vh;" :class="language==='html'?'preview-code':''">
            <ace-editor ref="editor" v-model="code" @init="editorInit" :options="options" :theme="theme"
                        :lang="language"/>
        </div>
        <div style="width: 50%;height: 76vh;float: right" v-if="language==='html'">
            <iframe style="top: 0;background: #fff;width: 100%;height: 100%" class="edit-area" id="preview"
                    frameborder="0"></iframe>
        </div>
    </el-card>
</template>

<script>
    import AceEditor from "../../../components/AceEditor";


    export default {
        name: "CodeEditor",
        components: {AceEditor},
        created() {
            this.$nextTick(() => {

            })
        },
        data() {
            return {
                code: '',
                codeJava: 'package com.text.code;\n' +
                    '\n' +
                    '/**\n' +
                    ' * @author csnight\n' +
                    ' * @description\n' +
                    ' * @since 2019/12/31 13:50\n' +
                    ' */\n' +
                    'public class Test {\n' +
                    '    public static void main(String[] args) {\n' +
                    '        System.out.println("Hello World!");\n' +
                    '    }\n' +
                    '}\n',
                codeHtml: '<html lang="en">\n' +
                    '    <body>\n' +
                    '        HelloWorld\n' +
                    '    </body>\n' +
                    '</html>',
                theme: 'monokai', language: 'java',
                options: {
                    wrap: true,
                    highlightActiveLine: true,
                    autoScrollEditorIntoView: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    showPrintMargin: false,
                    enableLiveAutocompletion: true
                },
                themeData: [
                    ['Chrome'],
                    ['Clouds'],
                    ['Crimson Editor'],
                    ['Dawn'],
                    ['Dreamweaver'],
                    ['Eclipse'],
                    ['GitHub'],
                    ['IPlastic'],
                    ['Solarized Light'],
                    ['TextMate'],
                    ['Tomorrow'],
                    ['XCode'],
                    ['Kuroir'],
                    ['KatzenMilch'],
                    ['SQL Server', 'sqlserver', 'light'],
                    ['Ambiance', 'ambiance', 'dark'],
                    ['Chaos', 'chaos', 'dark'],
                    ['Clouds Midnight', 'clouds_midnight', 'dark'],
                    ['Dracula', '', 'dark'],
                    ['Cobalt', 'cobalt', 'dark'],
                    ['Gruvbox', 'gruvbox', 'dark'],
                    ['Green on Black', 'gob', 'dark'],
                    ['idle Fingers', 'idle_fingers', 'dark'],
                    ['krTheme', 'kr_theme', 'dark'],
                    ['Merbivore', 'merbivore', 'dark'],
                    ['Merbivore Soft', 'merbivore_soft', 'dark'],
                    ['Mono Industrial', 'mono_industrial', 'dark'],
                    ['Monokai', 'monokai', 'dark'],
                    ['Pastel on dark', 'pastel_on_dark', 'dark'],
                    ['Solarized Dark', 'solarized_dark', 'dark'],
                    ['Terminal', 'terminal', 'dark'],
                    ['Tomorrow Night', 'tomorrow_night', 'dark'],
                    ['Tomorrow Night Blue', 'tomorrow_night_blue', 'dark'],
                    ['Tomorrow Night Bright', 'tomorrow_night_bright', 'dark'],
                    ['Tomorrow Night 80s', 'tomorrow_night_eighties', 'dark'],
                    ['Twilight', 'twilight', 'dark'],
                    ['Vibrant Ink', 'vibrant_ink', 'dark']
                ],
                languages: [
                    {name: 'java', caption: 'Java'},
                    {name: 'csharp', caption: 'C#'},
                    {name: 'python', caption: 'Python'},
                    {name: 'html', caption: 'Html'},
                    {name: 'javascript', caption: 'Javascript'},
                    {name: 'json', caption: 'Json'},
                    {name: 'sql', caption: 'SQL'},
                    {name: 'xml', caption: 'XML'},
                    {name: 'yaml', caption: 'YAML'}],

                themes: []
            }
        },
        methods: {
            editorInit: function () {
                // eslint-disable-next-line no-undef
                require('brace/ext/language_tools');//language extension prerequsite...
                for (let i = 0; i < this.languages.length; i++) {
                    // eslint-disable-next-line no-undef
                    require('brace/mode/' + this.languages[i].name);
                    // eslint-disable-next-line no-undef
                    require('brace/snippets/' + this.languages[i].name);
                }
                // eslint-disable-next-line no-undef
                require('brace/theme/monokai'); //snippet
                this.getThemes();
                this.code = this.codeJava;
            }, getThemes() {
                this.themes = this.themeData.map(function (data) {
                    let name = data[1] || data[0].replace(/ /g, '_').toLowerCase();
                    // eslint-disable-next-line no-undef
                    require('brace/theme/' + name); //snippet
                    return {
                        caption: data[0],
                        theme: 'brace/theme/' + name,
                        isDark: data[2] === 'dark',
                        name: name
                    };
                });
            }, submit() {
                let htmlValue = this.$refs.editor.editor.getValue();
                document.getElementById('preview').srcdoc = '<!DOCTYPE html><html lang=""><head><meta charset="utf-8" /><title>代码测试</title>' +
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>' +
                    '<meta name="format-detection" content="telephone=no" />' +
                    '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' +
                    '<meta name="apple-mobile-web-app-capable" content="yes" />' +
                    '<meta http-equiv="X-UA-Compatible" content="chrome=1,IE=edge"/>' +
                    '</head><body>' + htmlValue + '</body></html>';
            }, langChange() {
                if (this.language === 'html') {
                    this.code = this.codeHtml;
                } else if (this.language === 'java') {
                    this.code = this.codeJava;
                } else {
                    this.code = '';
                }
            }, jsonCompact() {
                try {
                    let json = JSON.parse(this.$refs.editor.editor.getValue());
                    this.$refs.editor.editor.setValue(JSON.stringify(json));
                } catch (e) {
                    this.$message.error({
                        message: "格式化错误! " + e.message
                    });
                }
            }, jsonFormat() {
                try {
                    let json = JSON.parse(this.$refs.editor.editor.getValue());
                    this.$refs.editor.editor.setValue(JSON.stringify(json, null, 4));
                } catch (e) {
                    this.$message.error({
                        message: "格式化错误! " + e.message
                    });
                }
            }
        }
    }
</script>

<style scoped>
    .card-op {
        float: right;
        display: flex;
        align-items: center;
        margin-right: 10px;
        font-size: 12px
    }

    .preview-code {
        width: 50% !important;
        float: left;
    }
</style>