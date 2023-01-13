<template>
    <v-card class="stream-settings" :class="{ fullscreen, exact: !$store.state.app.vkapp }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="stream-settings__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
                <v-btn @click="apply" :disabled="!paid" icon>
                    <v-icon>mdi-check</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs class="stream-settings__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                <v-tab @click="$emit('close')" :ripple="false">
                    <v-icon :color="color">mdi-window-close</v-icon>
                </v-tab>
                <v-tab @click="apply" :disabled="!paid" :ripple="false">
                    <v-icon :color="color">mdi-check</v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="stream-settings__pane scroller" ref="pane">
            <v-layout column py-4 px-5>
                <v-flex class="fieldset">
                    <div class="legend">{{ $t('common.filter') }}</div>

                    <v-combobox @change="updateMarks"
                        :label="$t('stream.add_tags')"
                        :disabled="!paid"
                        :value="marks"
                        append-icon=""
                        counter="10"
                        hide-details
                        multiple
                        flat
                        solo
                    >
                        <template #selection="{ attrs, item, index, parent, selected, disabled }">
                            <v-chip v-bind="attrs"
                                :key="index"
                                :disabled="disabled"
                                :input-value="selected"
                                @dblclick.stop="edit({ item, index, parent })"
                                @click.stop="select({ item, parent })"
                                @click:close="removeMarks({ index })"
                                class="v-chip--select-multi"
                                close
                                small
                            >
                                {{ cut({ item }) }}
                            </v-chip>
                        </template>
                    </v-combobox>
                </v-flex>

                <v-flex class="fieldset">
                    <div class="legend">{{ $t('stream.stop') }}</div>

                    <v-checkbox v-model="swear" :label="$t('stream.profanity')" :disabled="!paid" :ripple="false" :color="color" />

                    <v-combobox @change="updateWords"
                        :label="$t('common.keywords')"
                        :disabled="!paid"
                        :value="words"
                        append-icon=""
                        hide-details
                        multiple
                        flat
                        solo
                    >
                        <template #selection="{ attrs, item, index, parent, selected, disabled }">
                            <v-chip v-bind="attrs"
                                :key="index"
                                :disabled="disabled"
                                :input-value="selected"
                                @dblclick.stop="edit({ item, index, parent })"
                                @click.stop="select({ item, parent })"
                                @click:close="removeWords({ index })"
                                class="v-chip--select-multi"
                                close
                                small
                            >
                                {{ cut({ item }) }}
                            </v-chip>
                        </template>
                    </v-combobox>
                </v-flex>

                <v-flex class="fieldset">
                    <div class="legend">{{ $t('common.repeater') }}</div>

                    <v-layout class="input-query">
                        <v-select v-model="method"
                            class="type-select"
                            :items="['POST','PUT']"
                            :disabled="!paid"
                            :item-color="color"
                            :color="color"
                            hide-details
                            dense
                            flat
                            solo
                        />
                        <v-text-field
                            class="url-field"
                            :disabled="!paid"
                            v-model="url"
                            label="URL"
                            hide-details
                            flat
                            solo
                        />
                    </v-layout>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import common from '~/mixins/stream/common'

    const merge = response => Object.assign({}, ...response.map(({ data }) => data)),
        check = response => !response.some(({ status }) => status !== 200) &&
            !response.some(({ data }) => !data.set),

        prepare = ctx => {
            let { method, url, marks, swear, words: list } = ctx

            return {
                stop: { list, swear: swear ? 1 : 0 },
                query: url ? { method, url } : null,
                marks
            }
        }

    export default {
        mixins: [common],

        data: () => ({
            smooth: null,
            swear: false,

            words: [],
            marks: [],

            method: '',
            url: ''
        }),
        computed: {
            paid() {
                return this.subscribe?.stream && this.subscribe.stream > (Date.now() / 1000 | 0)
            },
            fullscreen() {
                return this.mobile || this.$store.state.app.vkapp
            },
            subscribe() {
                return this.$store.state.app.subscribe
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            marks(array) {
                if (array.length > 10) {
                    this.marks = array.slice(0, 10)
                }
            }
        },
        methods: {
            updateMarks(marks)
            {
                this.marks = marks.filter(Boolean)
            },
            removeMarks({ index })
            {
                this.marks.splice(index, 1)
            },
            updateWords(words)
            {
                this.words = words.filter(Boolean)
            },
            removeWords({ index })
            {
                this.words.splice(index, 1)
            },
            select({ index, parent })
            {
                parent.selectedIndex = index
            },
            edit({ item, index, parent })
            {
                parent.internalSearch = item
                parent.editingIndex = index
                parent.selectedIndex = -1
            },
            setup({ marks, query, stop })
            {
                this.swear = stop.swear ? !!Number(stop.swear) : false
                this.words = stop.list ? stop.list : []
                this.marks = marks || []

                this.method = query.method || 'POST'
                this.url = query.url || ''
            },
            send(settings)
            {
                if (this.$store.state.app.user) {
                    settings.uid = this.$store.state.app.user.id
                }

                return Promise.all([
                    this.$axios.post('/setrules', settings)
                 // this.$axios.post('/setquery', { query }),
                 // this.$axios.post('/stoplist', { stop  })
                ])
            },
            emit(ok)
            {
                this.$bus.$emit('snack', ok
                    ? { content: 'common.settings_saved', color: 'success' }
                    : { content: 'common.error', color: 'error' }
                )
            },
            cut({ item = '' })
            {
                return item.length > 13 ? item.slice(0, 12) + '…' : item
            },
            apply()
            {
                if (!this.paid) {
                    return this.$bus.$emit('snack', {
                        content: 'Требуется провести оплату функционала',
                        color: 'error',
                        raw: true
                    })
                }

                this.send(prepare(this)).then(response => {
                    const success = check(response)

                    if (success) {
                        this.commitSettings(merge(response))
                    }

                    this.emit(success)
                })
            },
            initScroll()
            {
                if (this.smooth || !this.$refs.pane) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$refs.pane, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' }
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$refs.pane, {
                                damping: this.mobile ? .1 : 1,
                                continuousScrolling: false
                            })

                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            }
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)

            if (this.$store.state.socket.settings) {
                this.setup(this.$store.state.socket.settings)
            }
        }
    }
</script>

<style lang="scss" scoped>
    @mixin layout() {
        & > .layout {
            .v-chip--removable .v-chip__content {
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .input-query {
                align-items: center;
                padding: 0 1em;

                .type-select {
                    flex: 0 5 101px;

                    .v-input__control > .v-input__slot {
                        padding: 0 10px;
                    }
                }
                .url-field {
                    flex: 5 0 10%;
                    max-width: 100%;
                }
            }
            .fieldset {
                position: relative;
                padding: 10px 0;
                margin: 7px 0;

                border: 2px solid rgba(0,0,0,.54);
                border-radius: 5px;

                background-color: white;

                &:last-child {
                    margin: 7px 0 0;
                }
                .legend {
                    position: absolute;
                    top: -14px;
                    left: 0;

                    margin-left: 10px;
                    padding: 0 5px;

                    white-space: nowrap;
                    background-color: inherit;
                    user-select: none;

                    z-index: 1;
                }
                .v-input--selection-controls {
                    margin: 10px 0 0 10px;

                    .v-input__slot {
                        margin: 0;

                        & > .v-label {
                            display: block;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                        }
                    }
                }
                .input-query .v-select__selection {
                    user-select: none;
                }
                .v-chip {
                    .v-chip__content {
                        user-select: none;
                        cursor: pointer;
                    }
                    &.theme--dark .v-chip__content {
                        color: rgba(227,227,227, .7);
                    }
                }
            }
        }
    }
    .stream-settings {
        height: 100%;

        &.fullscreen {
            min-height: 100%;
            height: 100%;
        }
        .stream-settings__btn-wrapper {
            max-height: 60px;
            padding: 0 10px;

            ::v-deep .v-btn {
                cursor: pointer;
                margin: 0 5px;

                &:hover::before {
                    background-color: currentColor;
                }
            }
        }
        .stream-settings__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .stream-settings__pane ::v-deep .scroll-content,
        .stream-settings__pane ::v-deep .os-content,
        .stream-settings__pane {
            padding: 0 !important;
            min-height: 350px;
            max-height: 500px;
            @include layout();

            &.os-host {
                min-height: calc(100vh - 86px);
            }
        }
        .stream-settings__pane {
            ::v-deep .scrollbar-track.scrollbar-track-y {
                margin-right: 5px;
                background: none;

                .scrollbar-thumb {
                    width: 5px;
                }
            }
        }
        &.theme--dark {
            .stream-settings {
                ::v-deep .v-system-bar {
                    background-color: transparent;
                    border-color: transparent;
                }
            }
            .stream-settings__tabs-header {
                border-bottom: 1px solid #7a7a7a;
            }
            .stream-settings__pane ::v-deep .scroll-content,
            .stream-settings__pane ::v-deep .os-content,
            .stream-settings__pane {
                & > .layout {
                    .fieldset {
                        border-color: #7a7a7a;
                        background-color: #1e1e1e;
                    }

                }
            }
            .stream-settings__pane {
                ::v-deep .scrollbar-track.scrollbar-track-y {
                    .scrollbar-thumb {
                        background: #424242;
                    }
                }
            }
        }
    }
</style>
