<template>
    <graph-drag
        hash="erase"
        class="drag-erase"
        @close="make(false)"
        @apply="make(true)"
        :title="$t('graph.erase')"
        :apply="true"
        :close="true"
        :snap="snap"
    >
        <div class="erase-pane">
            <div class="sliders">
                <graph-line-thickness class="pt-3" dense />
                <graph-alpha-chanel class="pt-4" dense />
                <graph-soft-sensor class="pt-4" dense />
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

                    this.$parent.eraseModeToggle(null, doit)
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
            this.$parent.eraseModeToggle(this.canvas.getActiveObject())
        }
    }
</script>

<style lang="scss" scoped>
    .drag-erase {
        max-width: 210px;

        .erase-pane {
            display: flex;
            flex-direction: column;

            ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                max-height: 30px;
                user-select: none;
                cursor: pointer;

                fieldset {
                    padding: 0 8px;
                }
                .v-select__slot {
                    min-height: unset;
                }
            }
        }
    }
</style>
