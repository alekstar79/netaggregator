<script>
    export default {
        inheritAttrs: false,

        render(h)
        {
            return h('div', this.$attrs, this.$slots.default)
        }
    }
</script>
