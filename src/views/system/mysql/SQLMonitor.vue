<template>
    <i-frame :src="src"/>
</template>

<script>
    import IFrame from "../../../components/IFrame";

    export default {
        name: "SQLMonitor",
        components: {IFrame},
        data() {
            return {
                src: this.$store.getters.baseUrl + "/druid/index.html"
            }
        }
    }
</script>

<style scoped>

</style>
