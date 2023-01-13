<template>
    <v-dialog v-model="proxy" :width="mobile ? '100%' : width" :fullscreen="mobile" :hide-overlay="mobile">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" :color="barColor" />

        <v-card v-if="editor" class="info-dialog__editor" :class="{ fullscreen: mobile }" elevation="0">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="info-dialog__btn-wrapper" justify-start>
                    <v-btn @click="closeEditor" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="performData" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="info-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="closeEditor" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab @click="performData" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="editor">
                <v-layout column>
                    <v-flex>
                        <lazy-widget-text-field
                            v-model="name"
                            :label="$t('widget.player')"
                            :rules="[rule]"
                            :color="color"
                            :error="long"
                        />
                    </v-flex>
                    <v-flex>
                        <v-text-field
                            v-model="time"
                            :label="$t('widget.time')"
                            :rules="[digit]"
                            :color="color"
                            :error="bad"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-card v-else class="info-dialog__tool-panel" :class="{ fullscreen: mobile }" elevation="0">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="info-dialog__btn-wrapper" justify-start>
                    <v-btn @click="tab = 0" text>
                        {{ $i18n.locale === 'ru' ? 'А' : 'A' }}
                    </v-btn>
                    <v-btn @click="tab = 1" text>
                        {{ $i18n.locale === 'ru' ? 'Б' : 'B' }}
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="info-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="tab = 0" :ripple="false">
                        <div class="tab-label">
                            {{ match.team_a.name || $t('widget.team_a') }}
                        </div>
                    </v-tab>
                    <v-tab @click="tab = 1" :ripple="false">
                        <div class="tab-label">
                            {{ match.team_b.name || $t('widget.team_b') }}
                        </div>
                    </v-tab>
                </v-tabs>
            </template>

            <div class="admin__admin-body">
                <v-tabs-items v-model="tab">
                    <v-tab-item :key="0">
                        <v-card-text>
                            <v-chip v-for="(a, i) in match.events.team_a"
                                :key="`${i}${a.event}${a.minute}`"
                                @click:close="remove(i, 'team_a')"
                                close
                            >
                                {{ a.event }}{{ a.minute ? ` (${a.minute})` : '' }}
                            </v-chip>
                            <v-chip :disabled="match.events.team_a.length >= 6"
                                @click="openEditor('team_a')"
                                class="add-chip"
                            >
                                +
                            </v-chip>
                        </v-card-text>
                    </v-tab-item>
                    <v-tab-item :key="1">
                        <v-card-text>
                            <v-chip v-for="(b, i) in match.events.team_b"
                                :key="`${i}${b.minute}${b.event}`"
                                @click:close="remove(i, 'team_b')"
                                close
                            >
                                {{ b.event }}{{ b.minute ? ` (${b.minute})` : '' }}
                            </v-chip>
                            <v-chip :disabled="match.events.team_b.length >= 6"
                                @click="openEditor('team_b')"
                                class="add-chip"
                            >
                                +
                            </v-chip>
                        </v-card-text>
                    </v-tab-item>
                </v-tabs-items>

                <v-card-text>
                    <v-text-field v-model="match.state" :label="$t('widget.progress')" :rules="[rule]" :color="color" />
                </v-card-text>
            </div>

            <v-card-actions>
                <v-layout justify-center pa-3 wrap>
                    <v-btn class="shadowless" @click="close(true)" :color="color">
                        {{ $t('common.apply') }}
                    </v-btn>
                    <v-btn v-if="mobile" class="shadowless" @click="close()" :color="color">
                        {{ $t('common.close') }}
                    </v-btn>
                </v-layout>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { match } from '~/assets/data/widget'
    import cloneDeep from 'lodash/cloneDeep'

    export default {
        props: ['value', 'set'],

        model: {
            event: 'input',
            prop: 'value'
        },
        data: () => ({
            editor: false,
            force: null,
            width: 480,

            long: false,
            bad: false,

            match: null,
            name: '',
            time: '',
            tab: 0
        }),
        computed: {
            proxy: {
                set(v) {
                    this.$emit('input', v)
                },
                get() {
                    return this.value
                }
            },
            barColor() {
                return this.$vuetify.theme.dark ? '#1e1e1e' : '#f5f5f5'
            },
            backgroundImage() {
                const { tab, match: { team_a, team_b } } = this,
                    url = tab ? team_b.src : team_a.src

                return url ? `url(${url})` : null
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            empty() {
                return this.name === '' || this.time === ''
            }
        },
        watch: {
            value: 'start',

            editor(v) {
                this.width = v ? 320 : 480
            }
        },
        methods: {
            digit(v)
            {
                return ((this.bad = !!(v && !/^\d+$/.test(v)))) ? this.$t('widget.bad_digit') : true
            },
            rule(v)
            {
                return ((this.long = !!(v && v.length > 50))) ? this.$t('widget.more_50') : true
            },
            openEditor(team)
            {
                if (this.match.events[team].length >= 6) {
                    return this.$bus.$emit('snack', {
                        content: 'The maximum possible number of events has been reached',
                        color: 'error'
                    })
                }

                this.name = ''
                this.time = ''

                this.editor = team
            },
            closeEditor()
            {
                this.editor = false
            },
            performData()
            {
                if (this.empty || this.long || this.bad || this.match.events[this.editor] >= 6) return

                this.match.events[this.editor].push({ minute: this.time, event: this.name })

                this.closeEditor()
            },
            remove(idx, team)
            {
                this.match.events[team] = this.match.events[team].filter((_, i) => i !== idx)
            },
            start(v)
            {
                switch (true) {
                    case !!v:
                        this.match = cloneDeep(this.set.match)
                        break
                    case !v:
                        this.$emit('input', false)
                        break
                }
            },
            close(apply = false)
            {
                const { match: { events, state } } = this

                this.$emit('update', apply ? { ...events, state } : null)
            }
        },
        created()
        {
            this.match = match()
        }
    }
</script>

<style lang="scss" scoped>
    .info-dialog__editor,
    .info-dialog__tool-panel {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .link-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        .info-dialog__btn-wrapper {
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
        .info-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
    }
    .info-dialog__editor {
        ::v-deep .v-card__text.editor {
            padding: 15px;
        }
    }
    .info-dialog__tool-panel {
        .admin__admin-body {
            ::v-deep .v-chip.add-chip {
                border-radius: 50%;
                height: 36px;

                &.v-chip--disabled .v-chip__content {
                    cursor: default;
                }
                .v-chip__content {
                    display: block;
                    cursor: pointer;
                    line-height: 22px;
                    font-size: 26px;
                    height: 26px;
                }
            }
            ::v-deep .v-card__text {
                .v-text-field {
                    padding-top: 0;
                    margin-top: 0;

                    .v-input__slot {
                        margin-bottom: 0;
                    }
                }
            }
        }
        ::v-deep .v-card__actions {
            padding: 0 0 10px 0;

            .v-btn {
                margin: 10px;
            }
        }
    }
    @media (max-width: 390px) {
        .info-dialog__tool-panel {
            ::v-deep .v-card__actions .v-btn {
                margin: 5px;
                width: 100%;
            }
        }
    }
</style>
