<script>
    import { replaceChildrenWithShadowDom, makeShadowRaw } from '~/directives/shadow'

    /**
    * @see https://github.com/2A5F/shadow/tree/vue2
    */
    export default {
        props: {
            abstract: {
                type: Boolean,
                default: false
            },
            static: {
                type: Boolean,
                default: false
            },
            tag: {
                type: String,
                default: 'div'
            },
            rootClass: {
                type: String
            },
            slotTag: {
                type: String,
                default: 'div'
            },
            slotClass: {
                type: String
            },
            slotId: {
                type: String
            }
        },
        data: () => ({
            pabstract: false,
            pstatic: false
        }),
        render(h)
        {
            return h(this.tag, { class: this.rootClass }, [
                this.static
                    ? this.$slots.default
                    : h(this.slotTag, { class: this.slotClass, attrs: { id: this.slotId } }, [this.$slots.default])
            ])
        },
        mounted()
        {
            this.abstract
                ? makeShadowRaw(this.$el.parentElement, this.$el.childNodes)
                : replaceChildrenWithShadowDom(this.$el)
        }
    }
</script>
