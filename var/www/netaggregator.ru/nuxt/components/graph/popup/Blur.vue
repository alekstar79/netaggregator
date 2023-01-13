<template>
    <graph-drag
        hash="blur"
        class="drag-blur"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.blur')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="blur-pane">
            <div class="sliders">
                <graph-line-thickness class="pt-2" dense />
                <graph-blur-factor class="pt-3" dense />
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

                    this.$parent.blurModeToggle(null, doit)
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
            this.$parent.blurModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-blur {
        max-width: 210px;

        .blur-pane {
            display: flex;
            flex-direction: column;
        }
    }
</style>
