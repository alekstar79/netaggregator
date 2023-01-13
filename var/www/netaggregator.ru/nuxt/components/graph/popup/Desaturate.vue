<template>
    <graph-drag
        hash="desaturate"
        class="drag-desaturate"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.desaturate')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="desaturate-pane">
            <div class="sliders">
                <graph-line-thickness class="pt-2" dense />
            </div>
        </div>
    </graph-drag>
</template>

<script>
    export default {
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            canvas() {
                return this.$parent.canvas
            }
        },
        data: () => ({
            canceled: false
        }),
        methods: {
            make(doit, emit = true)
            {
                if (!this.canceled) {
                    this.canceled = true

                    this.$parent.desaturateModeToggle(null, doit)
                    emit && this.$emit('tool:cancel')
                }
            }
        },
        beforeDestroy()
        {
            this.make(false, false)
        },
        mounted()
        {
            this.$parent.desaturateModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-desaturate {
        max-width: 210px;

        .desaturate-pane {
            display: flex;
            flex-direction: column;
        }
    }
</style>
