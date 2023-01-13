<template>
    <v-dialog v-model="proxy" :width="mobile ? '100%' : '320px'" :fullscreen="mobile" :hide-overlay="mobile">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" :color="barColor" />

        <v-card class="link-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="link-dialog__btn-wrapper" justify-start>
                    <v-btn @click="close" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="apply" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn v-if="set.remove" @click="remove" icon>
                        <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="link-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="close" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab @click="apply" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                    <v-tab v-if="set.remove" @click="remove" :ripple="false">
                        <v-icon :color="color">mdi-trash-can-outline</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="link-dialog__card-pane">
                <v-layout column>
                    <v-flex v-if="name !== false">
                        <lazy-widget-text-field
                            v-model="name"
                            :color="color"
                            :rules="[rule.bind(_self, 'name')]"
                            :label="$t('widget.label_name')"
                            :error-messages="$t(reqName)"
                            :error="errorName || long"
                        />
                    </v-flex>
                    <v-flex>
                        <v-text-field
                            v-model="link"
                            :color="color"
                            :rules="[rule.bind(_self, 'link')]"
                            :label="$t('widget.label_link')"
                            :error-messages="$t(reqLink)"
                            :error="errorLink"
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
            errorName: false,
            errorLink: false,

            both: false,
            long: false,

            reqName: '',
            reqLink: '',
            name: '',
            link: '',

            ln: 50
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
            errorLong() {
                const { ln, $i18n: { locale = 'ru' } } = this

                return locale === 'en' ? `Length more than ${ln} chars` : `Длина более ${ln} символов`
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
            rule(entity, v)
            {
                if (this.name) {
                    this.errorName = false
                    this.reqName = ''
                }
                if (this.link) {
                    this.errorLink = false
                    this.reqLink = ''
                }
                if (entity === 'name') {
                    this.long = !!(v && this.ln && this.ln < v.length)

                    return this.long ? this.errorLong : true
                }

                return true
            },
            setError(e)
            {
                if (!this.name) {
                    this.reqName = e ? 'widget.required' : ''
                    this.errorName = e
                }
                if (!this.link) {
                    this.reqLink = e ? 'widget.required' : ''
                    this.errorLink = e
                }
            },
            reset()
            {
                this.required = ''
                this.error = false
                this.long = false

                this.$emit('input', false)
            },
            start(v)
            {
                switch (true) {
                    case !!v:
                        this.name = this.set.name
                        this.link = this.set.link
                        this.both = this.set.both
                        this.ln = this.set.ln
                        break

                    case !v:
                        this.reset()
                        break
                }
            },
            apply()
            {
                this.setError(false)

                if (!this.name && !this.link) {
                    this.emit()
                }
                if (this.both && (!this.name || !this.link)) {
                    return this.setError(true)
                }
                if (this.long) {
                    return
                }

                this.emit()
            },
            emit()
            {
                const name = this.name, link = this.link

                this.$emit('update', { name, link })
                this.reset()
            },
            close()
            {
                this.setError(false)
                this.$emit('update', { close: true })
                this.reset()
            },
            remove()
            {
                this.setError(false)
                this.$emit('update', { remove: true })
                this.reset()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .link-dialog__card {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .link-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        .link-dialog__btn-wrapper {
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
        .link-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
            &.theme--dark {
                border-color: #8f8f8f;
            }
        }
        .v-card__text::v-deep.link-dialog__card-pane {
            padding: 15px 20px;

            .v-text-field {
                margin-top: 0;
            }
        }
    }
</style>
