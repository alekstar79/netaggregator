<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" height="18" width="18">
        <g fill="none" fill-rule="evenodd">
            <rect :fill="fill" height="18" width="18" rx="9" />

            <template v-if="close">
                <path stroke="#FFF" stroke-width="2" stroke-linecap="round" d="M6 6L12 12M12 6L6 12" />
            </template>
            <template v-else-if="checked">
                <path stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 10l3 3 5-7" />
            </template>
            <template v-else>
                <rect stroke="#c1c9d1" height="17" width="17" rx="8.5" />
            </template>
        </g>
    </svg>
</template>

<script>
    import theme from '~/plugins/theme'

    export default {
        props: {
            checked: Boolean,
            close: Boolean
        },
        computed: {
            fill() {
                return this.close ? '#666' : this.checked ? this.color : '#FFF'
            },
            color() {
                return theme[this.$store.state.app.color]
            }
        }
    }
</script>
