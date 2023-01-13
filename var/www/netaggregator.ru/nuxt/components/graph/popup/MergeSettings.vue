<template>
    <graph-drag
        hash="merge-dialog"
        class="merge-settings"
        @close="$emit('tool:cancel')"
        :title="$t('graph.merge')"
        :close="true"
        :snap="snap"
    >
        <div v-if="merge" class="merge-popup">
            <v-flex class="merge__fonts-select">
                <v-select
                    v-model="current"
                    :label="$t('graph.composite')"
                    :color="color"
                    :items="list"
                    class="pt-1"
                    hide-details
                    outlined
                    dense
                    :menu-props="{
                        contentClass: 'composite-operation-menu',
                        maxWidth: 200
                    }"
                >
                    <template #item="{ item, on }">
                        <v-list-item v-on="on" :class="item">
                            {{ item }}
                        </v-list-item>
                    </template>
                </v-select>
            </v-flex>

            <v-flex class="merge__ungroup-btn pt-2">
                <v-btn class="shadowless" @click="merge.ungroup()" :color="color" small block>
                    {{ $t('graph.ungroup') }}
                </v-btn>
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
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            merge() {
                return this.$parent.canvas._objects.find(o => o.custom.unique === this.unique)
            },
            unique() {
                return this.$store.state.canvas.merge
            },
            current: {
                get() {
                    return this.merge.composite
                },
                set(v) {
                    this.merge.composite = v
                }
            }
        },
        watch: {
            merge(v) {
                v || (setTimeout(() => {
                    this.$emit('tool:cancel')
                }, 1e2))
            }
        },
        data: () => ({
            list: [
                'source-over',
                'source-in',
                'source-out',
                'source-atop',
                'destination-over',
                'destination-in',
                'destination-out',
                'destination-atop',
                'lighter',
                'xor',
                'multiply',
                'screen',
                'overlay',
                'darken',
                'lighten',
                'difference',
                'saturation',
                'luminosity'
            ]
        }),
        beforeDestroy()
        {
            this.$store.commit('canvas/set', { merge: null })
        }
    }
</script>

<style lang="scss" scoped>
    .merge-settings {
        max-width: 210px;
    }
</style>
