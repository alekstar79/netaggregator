<template>
    <v-card v-on="$listeners" :style="styles" ref="card">
        <helper-offset v-if="hasOffset" :full-width="fullWidth" :offset="offset" :inline="inline">
            <v-card v-if="!$slots.offset"
                class="v-card--material__header"
                :class="`elevation-${elevation}`"
                :style="{ padding }"
                :color="color"
                dark
            >
                <slot v-if="!title && !text" name="header" />

                <span v-else>
                    <h4 class="title font-weight-light mb-2" v-text="title" />
                    <p class="category font-weight-thin" v-text="text" />
                </span>
            </v-card>

            <slot v-else name="offset" />
        </helper-offset>

        <v-card-text class="fill-height" :key="refresh">
            <slot />
        </v-card-text>

        <v-divider v-if="divider && $slots.actions" class="mx-3" />

        <v-card-actions v-if="$slots.actions" :key="refresh">
            <slot name="actions" />
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        inheritAttrs: false,

        props: {
            refresh: {
                type: String,
                default: ''
            },
            color: {
                type: String,
                default: 'info'
            },
            elevation: {
                type: [Number, String],
                default: 5
            },
            padding: {
                type: String,
                default: '0'
            },
            inline: {
                type: Boolean,
                default: false
            },
            fullWidth: {
                type: Boolean,
                default: false
            },
            divider: {
                type: Boolean,
                default: false
            },
            offset: {
                type: [Number, String],
                default: 24
            },
            title: {
                type: String,
                default: undefined
            },
            text: {
                type: String,
                default: undefined
            }
        },
        computed: {
            hasOffset() {
                return this.$slots.header || this.$slots.offset || this.offset || this.title || this.text
            },
            styles() {
                return this.hasOffset
                    ? { marginBottom: `${this.offset}px`, marginTop: `${2 * this.offset}px` }
                    : {}
            }
        },
        watch: {
            refresh: '$forceUpdate'
        },
        mounted()
        {
            this.$nextTick().then(() => this.$emit('ready', this.$refs.card))
        }
    }
</script>

<style lang="scss" scoped>
    .v-card--material__header {
        border-radius: 4px;
    }
</style>
