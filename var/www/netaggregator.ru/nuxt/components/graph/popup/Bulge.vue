<template>
    <graph-drag
        hash="bulge"
        class="drag-bulge"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.bulge')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="bulge-pane">
            <div class="sliders">
                <graph-line-thickness class="pt-2" dense />
                <graph-bulge-factor class="pt-3" dense />
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
        data: () => ({
            canceled: false
        }),
        computed: {
            canvas() {
                return this.$parent.canvas
            }
        },
        methods: {
            make(doit, emit = true)
            {
                if (!this.canceled) {
                    this.canceled = true

                    this.$parent.bulgeModeToggle(null, doit)
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
            this.$parent.bulgeModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-bulge {
        max-width: 210px;

        .bulge-pane {
            display: flex;
            flex-direction: column;
        }
    }
</style>
