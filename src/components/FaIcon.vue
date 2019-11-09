<template>
    <div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners"></div>
    <i v-else :class="iconName+' fa-icon'"></i>
</template>

<script>
    import {isExternal} from '../layout/linkVal'

    export default {
        name: 'FaIcon',
        props: {
            iconClass: {
                type: String,
                required: true
            },
            className: {
                type: String,
                default: ''
            }
        },
        computed: {
            isExternal() {
                return isExternal(this.iconClass)
            },
            iconName() {
                if (!this.className || this.className === '') {
                    return `fa fa-lg ${this.iconClass}`
                } else {
                    return `fa ${this.className} ${this.iconClass}`
                }
            },
            styleExternalIcon() {
                return {
                    mask: `url(${this.iconClass}) no-repeat 50% 50%`,
                    '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`
                }
            }
        }
    }
</script>

<style scoped>
    .fa-icon {
        width: 1em;
        height: 1em;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
    }

    .svg-external-icon {
        background-color: currentColor;
        mask-size: cover !important;
        display: inline-block;
    }
</style>
