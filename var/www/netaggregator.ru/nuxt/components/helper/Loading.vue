<template>
    <v-overlay :value="loading" :opacity="1" :color="color1">
        <v-overlay :opacity="0.4" :color="color2">
            <v-progress-circular indeterminate :size="circular" color="primary" />
        </v-overlay>
    </v-overlay>
</template>

<script>
/**
 * @see https://medium.com/js-dojo/custom-loading-spinner-component-in-nuxtjs-and-vuetify-8627015cfb28
 */
export default {
    props: {
        options: {
            type: Object,
            default: () => ({
                circular: 96,
                color1: '#fff',
                color2: '#303e72'
            })
        }
    },
    data: () => ({
        onceBefore: false,
        loading: false,

        circular: 96,
        color1: '#fff',
        color2: '#303e72'
    }),
    methods: {
        finish()
        {
            this.loading = false
        },
        start()
        {
            if (this.onceBefore) return

            this.onceBefore = true
            this.loading = true

            setTimeout(
                this.finish.bind(this),
                3e3
            )
        },
        force({ circular, color1, color2 })
        {
            this.circular = circular || this.options.circular

            this.color1 = color1 || this.options.color1
            this.color2 = color2 || this.options.color2

            this.loading = true
        }
    },
    beforeDestroy()
    {
        this.$bus.$off('loading:finish', this.finish)
        // this.$bus.$off('loading:start', this.force)
        // this.$bus.$off('loading:stop', this.finish)
    },
    created()
    {
        this.$bus.$on('loading:finish', this.finish)
        // this.$bus.$on('loading:start', this.force)
        // this.$bus.$on('loading:stop', this.finish)

        this.start()
    }
}
</script>
