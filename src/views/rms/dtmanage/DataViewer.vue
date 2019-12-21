<template>
    <div></div>
</template>

<script>
    export default {
        name: "DataViewer",
        props: {
            prefix: {
                type: String,
                require: true,
            }, ins: {
                type: String,
                require: true,
            }, tabName: {
                type: String,
                require: true,
            }
        },
    }
</script>

<style scoped>

</style>