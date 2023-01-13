<template>
    <v-dialog v-model="proxy" :fullscreen="mobile" :width="mobile ? '100%' : '320px'" :hide-overlay="mobile" content-class="team-dialog">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" :color="barColor" height="26px" />

        <v-card class="team-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="team-dialog__btn-wrapper" justify-start>
                    <v-btn @click="close" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="apply" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="team-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="close" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab @click="apply" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="team-dialog__card-pane">
                <v-layout column>
                    <v-flex>
                        <lazy-widget-text-field
                            v-model="name"
                            :label="$t('widget.designation')"
                            :rules="[rule.bind(_self, 'name')]"
                            :error="long.name"
                        />
                    </v-flex>
                    <v-flex>
                        <lazy-widget-text-field
                            v-model="descr"
                            :label="$t('widget.description')"
                            :rules="[rule.bind(_self, 'descr')]"
                            :error="long.descr"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['value', 'set'],

        model: {
            event: 'input',
            prop: 'value'
        },
        data: () => ({
            descr: '',
            name: '',

            long: {
                descr: false,
                name: false
            }
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
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'start'
        },
        methods: {
            rule(field, v)
            {
                return ((this.long[field] = !!(v && v.length > 50))) ? this.$t('widget.more_50') : true
            },
            reset()
            {
                this.long = { name: false, descr: false }
                this.$emit('input', false)
            },
            start(v)
            {
                switch (true) {
                    case !!v:
                        this.descr = this.set.descr
                        this.name = this.set.name
                        break

                    case !v:
                        this.reset()
                        break
                }
            },
            apply()
            {
                if (this.long.name || this.long.descr) return

                const name = this.name, descr = this.descr

                this.$emit('update', { name, descr })
                this.reset()
            },
            close()
            {
                this.$emit('update', { close: true })
                this.reset()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .team-dialog__card {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .team-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        .team-dialog__btn-wrapper {
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
        .team-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        ::v-deep .v-card__text.team-dialog__card-pane {
            padding: 15px;
        }
    }
</style>
