<template>
    <div class="icon-body">
        <el-input v-model="name" style="position: relative;" clearable placeholder="请输入图标名称" @clear="filterIcons"
                  @input.native="filterIcons">
            <i slot="suffix" class="el-icon-search el-input__icon"/>
        </el-input>
        <div class="icon-list">
            <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
                <fa-icon :icon-class="item._class" class-name="fa-1x" style="height: 30px;width: 30px;"/>
                <span>{{ item.name.substring(0,10) }}</span>
            </div>
            <div :key="'svg-redis'" @click="selectedIcon({_class:'svg-redis'})">
                <svg-icon icon-class="svg-redis"/>
                <span style="vertical-align: -0.7rem !important;margin-left: 15px">redis</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'IconSelect',
        props: {
            icons: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                name: '',
                iconList: this.icons
            }
        },
        methods: {
            filterIcons() {
                if (this.name) {
                    this.iconList = this.iconList.filter(item => item.name.includes(this.name))
                } else {
                    this.iconList = JSON.parse(JSON.stringify(this.icons))
                }
            },
            selectedIcon(item) {
                this.$emit('selected', item._class);
                document.body.click()
            },
            reset() {
                this.name = '';
                this.iconList = JSON.parse(JSON.stringify(this.icons))
            }
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .icon-body {
        max-width: 430px;
        min-width: 320px;
        padding: 10px;

        .icon-list {
            height: 200px;
            overflow-y: scroll;

            div {
                height: 30px;
                line-height: 30px;
                margin-bottom: -5px;
                cursor: pointer;
                width: 33%;
                float: left;
            }

            span {
                display: inline-block;
                vertical-align: -0.15em;
                fill: currentColor;
                overflow: hidden;
            }
        }
    }
</style>