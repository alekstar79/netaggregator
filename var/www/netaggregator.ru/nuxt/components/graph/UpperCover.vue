<template>
    <div class="upper__cover">
        <template v-for="(c, i) in components">
            <component :is="c" :key="i" />
        </template>
    </div>
</template>

<script>
    export default {
        props: {
            components: {
                type: Array
            },
            content: {
                type: Array
            },
            evented: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            content: {
                deep: true,
                handler(v) {
                    this.clear()

                    v.forEach(el => {
                        this.$el.appendChild(el)
                    })
                }
            }
        },
        data: () => ({
            events: [{ event: 'click', handler: null }]
        }),
        methods: {
            setUpEvents()
            {
                this.events.forEach(item => {
                    item.handler = this.emit.bind(this, item.event)
                    this.$el.addEventListener(item.event, item.handler)
                })
            },
            clearEvents()
            {
                this.events.forEach(item => {
                    this.$el.removeEventListener(item.event, item.handler)
                })
            },
            clear()
            {
                while (this.$el.firstChild) {
                    this.$el.removeChild(this.$el.firstChild)
                }
            },
            emit(name, e)
            {
                this.$bus.$emit(`upper-cover-${name}`, e)
            }
        },
        beforeDestroy()
        {
            this.evented && this.clearEvents()
        },
        mounted()
        {
            this.evented && this.setUpEvents()
        }
    }
</script>

<style scoped>
    .upper__cover {
        pointer-events: none;
        position: absolute;
        left: 0;
        top: 0;

        height: 100%;
        width: 100%;
    }
</style>
