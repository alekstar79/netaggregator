<template>
    <graph-drag
        hash="info-dialog"
        class="drag-info"
        @close="$emit('tool:cancel')"
        :title="$t('graph.info')"
        :close="true"
        :snap="snap"
    >
        <div class="img-info">
            <v-flex class="cursor-info pt-2">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.cursor') }}
                    </template>
                    <template #content>
                        {{ point ? 'x: ' + Math.round(point.x) + ', y: ' + Math.round(point.y) : 'x: 0, y: 0' }}
                    </template>
                </helper-fieldset>
            </v-flex>

            <v-flex class="scale-info pt-3">
                <helper-fieldset dense>
                    <template #label>
                        {{ $t('graph.scale') }}
                    </template>
                    <template #content>
                        {{ Math.round(scaled.scale * 100) + '%' }}
                    </template>
                </helper-fieldset>
            </v-flex>
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
            point() {
                return this.$store.state.canvas.point || { x: 0, y: 0 }
            },
            scaled() {
                return this.$store.state.canvas.scaled || { scale: 1 }
            }
        }
    }
</script>

<style scoped>
    .drag-info {
        max-width: 210px;
    }
</style>
