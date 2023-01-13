<template>
    <graph-drag
        hash="sharpen"
        class="drag-sharpen"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.sharpness')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="sharpen-pane">
            <div class="sliders">
                <graph-line-thickness class="pt-2" />
                <graph-sharp-factor class="pt-3" />
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
                return this.$parent.canvas || {}
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

                    this.$parent.sharpenModeToggle(null, doit)
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
            this.$parent.sharpenModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-sharpen {
        max-width: 210px;

        .sharpen-pane {
            display: flex;
            flex-direction: column;
        }
    }
</style>
