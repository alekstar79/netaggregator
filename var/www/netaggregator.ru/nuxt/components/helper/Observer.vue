<template>
    <div class="observer" />
</template>

<script>
    export default {
        props: {
            options: {
                type: Object,
                default: () => ({
                    rootMargin: '0px',
                    threshold: 0,
                    once: false
                })
            }
        },
        data: () => ({
            observer: null
        }),
        methods: {
            handler([entry])
            {
                if (entry && entry.isIntersecting) {
                    this.$emit('intersect')

                    if (this.options.once) {
                        this.observer.disconnect()
                    }
                }
            }
        },
        mounted()
        {
            this.observer = new IntersectionObserver(this.handler, /** @type IntersectionObserverInit */ this.options)

            this.observer.observe(this.$el)
        },
        destroyed()
        {
            this.observer.disconnect()
        }
    }
</script>
