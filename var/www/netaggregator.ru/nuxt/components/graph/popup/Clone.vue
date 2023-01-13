<template>
    <graph-drag
        hash="clone"
        class="drag-clone"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.clone')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="clone-pane">
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

                    this.$parent.cloneModeToggle(null, doit)
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
            this.$parent.cloneModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-clone {
        max-width: 210px;

        .clone-pane {
            display: flex;
            flex-direction: column;
        }
    }
</style>
