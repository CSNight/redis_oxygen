<template>
    <div>
        <div class="head-container">
            <el-tag>Support by Font Awesome v5.11</el-tag>
            <el-input clearable v-model="filter" placeholder="输入名称搜索" style="width: 200px;" size="mini"
                      @input.native="filterIcons" class="filter-item"/>
            <el-button type="text" @click="getByAlphabet('')">ALL</el-button>
            <el-button type="text" v-for="item in alphabet" :key="item" @click="getByAlphabet(item)">{{item.toUpperCase()}}</el-button>
        </div>
        <el-row class="row" v-loading.fullscreen.lock="loading" element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.6)">
            <dl class="font" v-for="(item,index) in iconDisp" :key="index">
                <el-tooltip :content="item._class">
                    <dt style="height: 20px"><i :class="'fa '+item._class"/></dt>
                </el-tooltip>
                <dt style="height:50px;width: 100%;;text-align: center;word-wrap: break-word;font-size: 11px">
                    {{item.name}}
                </dt>
            </dl>
        </el-row>
    </div>

</template>

<script>
    import {get_icons} from "@/api/system/menu_api";

    export default {
        name: "IconDB",
        created() {
            this.$nextTick(() => {
                this.init();
            })
        },
        data() {
            return {
                filter: '',
                alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
                    's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
                icons: [],
                iconDisp: [], loading: false
            }
        },
        methods: {
            init() {
                this.loading = true;
                get_icons().then((resp) => {
                    let iconSet = resp.data.message;
                    this.icons = iconSet;
                    this.iconDisp = iconSet;
                    this.loading = false;
                }).catch((resp) => {
                    this.loading = false;
                    this.$message.error({
                        message: "查询出错!" + resp.data.message
                    });
                });
            }, filterIcons() {
                this.loading = true;
                this.iconDisp = this.icons.filter(item => item.name.includes(this.filter));
                this.loading = false;
            }, getByAlphabet(e) {
                this.loading = true;
                this.iconDisp = this.icons.filter(item => item.name.startsWith(e));
                this.loading = false;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .row {
        display: flex;
        flex-wrap: wrap;
        min-height: 200px;

        .font {
            text-align: center;
            float: left;
            width: calc(100% / 16);
            display: flex;
            height: 80px;
            flex-wrap: wrap;
            justify-content: center;
            padding: .5rem;
            color: #888888;
            border-bottom: 1px solid #eee;

            dt {
                width: 4rem;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                text-align: center;

                i:hover {
                    transform: scale(2);
                }
            }
        }
    }

</style>