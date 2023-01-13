<template v-if="icon">
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height" :width="width" :fill="fill">
        <path :d="path" />
    </svg>
</template>

<script>
    /**
    * @type {Icons} icons
    */
    import * as icons from '~/assets/data/widget-icons'

    export default {
        props: {
            viewBox: {
                default: '0 0 50 50',
                type: String
            },
            height: {
                default: 24,
                type: [Number, String]
            },
            width: {
                default: 24,
                type: [Number, String]
            },
            fill: {
                default: '#999',
                type: String
            },
            target: {
                default: '',
                type: String
            }
        },
        data: () => ({
            list: Object.entries(icons).map(([id, path]) => ({ id, path }))
        }),
        computed: {
            icon() {
                return this.list.find(icon => this.target.includes(icon.id))
            },
            path() {
                return this.icon ? this.icon.path : null
            }
        }
    }
</script>
