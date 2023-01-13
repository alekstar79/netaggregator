<template>
    <div class="widget-filter" :class="themeClasses">
        <div class="widget-filter__viewport">
            <div class="legend">{{ $t('common.filter') }}</div>

            <v-combobox v-monit="hide"
                :class="equals ? 'disabled--color' : `${color}--color`"
                :value="filters"
                :color="color"
                ref="combobox"
                hide-details
                multiple
                outlined
            >
                <template #append>
                    <v-btn class="loader" :class="{ rotate }" :color="color" @click="apply" aria-label="reset" icon>
                        <v-icon :color="color">mdi-sync</v-icon>
                    </v-btn>
                </template>

                <template #selection="data">
                    <v-chip class="v-chip--select-multi"
                        :key="JSON.stringify(data.index)"
                        :input-value="data.selected"
                        :disabled="data.disabled"
                        @click:close="remove(data)"
                        @click.stop=""
                        close
                        small
                    >
                        {{ cut(data) }}
                    </v-chip>
                </template>
            </v-combobox>
        </div>

        <v-dialog v-model="open"
            :content-class="`mailing-filters ${themeClasses}`"
            :max-width="mobile ? '100%' : '540px'"
            :fullscreen="mobile"
        >
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <div class="dialog-bar">
                <template v-if="mobile && $store.state.app.vkapp">
                    <v-layout class="dialog-bar__btn-wrapper" justify-start>
                        <v-btn @click="$emit('toggle', false)" aria-label="close" icon>
                            <v-icon>mdi-window-close</v-icon>
                        </v-btn>
                        <v-btn @click="apply" aria-label="check" icon>
                            <v-icon>mdi-check</v-icon>
                        </v-btn>
                    </v-layout>
                </template>
                <template v-else-if="mobile">
                    <v-tabs :color="color" height="60px" hide-slider grow>
                        <v-tab @click="$emit('toggle', false)" :ripple="false">
                            <v-icon :color="color" dense>mdi-window-close</v-icon>
                        </v-tab>
                        <v-tab @click="apply" :ripple="false">
                            <v-icon :color="color" dense>mdi-check</v-icon>
                        </v-tab>
                    </v-tabs>
                </template>
                <template v-else>
                    <v-icon :color="color">mdi-filter-outline</v-icon>
                </template>
            </div>

            <div class="mailing-filters__dialog-pane">
                <v-layout py-4 px-2>
                    <lazy-chatbot-filters v-model="filters" />
                </v-layout>
            </div>
        </v-dialog>
    </div>
</template>

<script>
    import { hide } from '~/mixins/common'

    const fn = (a, f) => ({ ...a, [f.text]: f.value })

    export default {
        mixins: [hide],

        props: ['gid','open'],

        model: {
            event: 'toggle',
            prop: 'open'
        },
        directives: {
            monit: {
                bind(el, { value: callback }) {
                    callback()
                }
            }
        },
        computed: {
            mailing() {
                return this.$store.state.chatbot.mailings.find(g => g.gid === this.gid)
            },
            rotate() {
                return (this.mailing || {}).progress === 'filter'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            themeClasses() {
                return `theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`
            },
            filters: {
                get() {
                    const f = (this.mailing || {}).filters || {}

                    return Object.keys(f).reduce(
                        (a, k) => a.concat([{ text: k, value: f[k] }]),
                        []
                    )
                },
                set(v) {
                    this.equals = false

                    this.$store.commit('chatbot/setFilters', {
                        filters: v.reduce(fn, {}),
                        gid: this.gid
                    })
                }
            }
        },
        watch: {
            open(v) {
                this.$emit('toggle', v)
            },
            filters() {
                this.$emit('update')
            }
        },
        data: () => ({
            equals: true
        }),
        methods: {
            cut({ item: { text = '' } })
            {
                return text.length > 13 ? text.slice(0, 12) + '…' : text
            },
            remove({ index })
            {
                const filters = this.filters.slice()

                filters.splice(index, 1)

                this.filters = filters
                this.equals = false
            },
            apply()
            {
                this.$emit('toggle', false)

                if (this.equals || !this.gid) return

                this.$store.commit('chatbot/send', {
                    filters: this.filters.reduce(fn, {}),
                    action: 'filter',
                    type: 'mailing',
                    gid: this.gid
                })

                this.equals = true
            }
        }
    }
</script>

<style lang="scss" scoped>
    .widget-filter {
        & > .widget-filter__viewport  {
            position: relative;

            .legend {
                position: absolute;
                left: 15px;
                top: -12px;

                padding: 0 5px;
                background-color: #fff;
                z-index: 1;
            }
            ::v-deep .v-input.v-text-field {
                & > .v-input__control > .v-input__slot {
                    fieldset {
                        border: 2px solid;
                    }
                    .v-input__append-inner {
                        margin: auto !important;

                        .v-btn.loader {
                            cursor: pointer;

                            &:hover::before {
                                background-color: currentColor;
                            }
                            &.rotate {
                                animation: loader 1s infinite;
                            }
                        }
                    }
                }
            }
        }
        &.theme--dark > .widget-filter__viewport {
            color: #7a7a7a;

            .legend {
                background-color: #1e1e1e;
                color: #7a7a7a;
            }
            ::v-deep .v-input.v-text-field {
                & > .v-input__control > .v-input__slot {
                    .v-input__append-inner {
                        .v-btn.loader {
                            color: #7a7a7a !important;

                            .v-icon {
                                color: unset !important;
                            }
                        }
                    }
                    &:hover {
                        fieldset {
                            color: #7a7a7a;
                        }
                    }
                }
            }
        }
    }
    ::v-deep .mailing-filters {
        background-color: #fff;

        &.v-dialog--fullscreen {
            min-height: 100%;
            height: 100%;

            .mailing-filters__dialog-pane {
                max-height: calc(100vh - 90px);
            }
        }
        .dialog-bar {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 60px;
            width: 100%;

            background-color: rgb(250, 251, 252);
            border-bottom: 1px solid #e3e4e8;
            cursor: pointer;

            .dialog-bar__btn-wrapper {
                padding: 0 15px;

                ::v-deep .v-btn {
                    margin: 0 5px;
                }
            }
        }
        .mailing-filters__dialog-pane {
            min-height: 345px;
        }
        &.theme--dark {
            background-color: #1e1e1e;

            .dialog-bar {
                background-color: #1e1e1e;
                border-color: #424242;
            }
        }
    }
</style>
