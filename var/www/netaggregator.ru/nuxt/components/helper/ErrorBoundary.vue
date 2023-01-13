<script>
    /**
    * @see https://learn-vuejs.github.io/vue-patterns/ru/patterns/#%D0%BE%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0-%D0%BE%D1%88%D0%B8%D0%B1%D0%BE%D0%BA
    */
    export default {
        data: () => ({ error: false, info: '' }),

        errorCaptured(e, vm, info)
        {
            this.error = true
            this.info = info

            return false
        },
        render(h)
        {
            if (this.error) {
                return h('div', { class: 'layout column bg-error text-center' },
                    [
                        h('p', `Sorry, error occured in ${this.info}.`),
                        h('p', 'Please try again later.')
                    ]
                )
            }

            return this.$slots.default[0]
        }
    }
</script>
