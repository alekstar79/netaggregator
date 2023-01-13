<template>
    <v-layout justify-center>
        <material-card class="module widget-donation" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 7 }" class="widget-header__title pa-3">
                        {{ $t('widget.donat') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools :tools="tools" @toggle="assignEntity" v-on="$listeners" />
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header :value="donat" v-on="$listeners" optional />

            <v-layout class="module-body" column>
                <div class="module-body__donation">
                    <div class="module-body__donation-content">
                        <lazy-widget-text-field
                            v-if="text"
                            v-model="donat.text"
                            v-click-outside="clickOutside"
                            :rules="[v => v.length > 80 ? $t('widget.more_80') : true]"
                        />
                        <v-flex v-else
                            @click="text = true"
                            v-text="donat.text || $t('widget.upto_80')"
                            class="module-body__donation--text"
                        />
                    </div>

                    <vue-slider v-model="donat.funded" :dot-attrs="{ 'aria-label': 'slider-dot' }" v-bind="options" />

                    <div @click="goalDialog" class="module-body__donation-data">
                        <b>{{ donat.funded | gap }}</b> / <span>{{ total }}</span>

                        <span class="module-body__donation--desc">
                            {{ $t('widget.collected') }}
                        </span>
                    </div>

                    <div @click="backersDialog" class="module-body__donation-data">
                        <span>{{ backers | humans(isRu) }}</span>

                        <span class="module-body__donation--desc">
                            {{ $t('widget.donated') }}
                        </span>
                    </div>

                    <v-btn @click="openDialog(donat, { link: 'button_url' })"
                        class="module-body__donation-button shadowless"
                        v-text="$t('widget.donate')"
                        small
                    />
                </div>
            </v-layout>

            <div @click="openDialog(donat, { name: 'more', link: 'more_url', ln: 100, both: true })"
                class="flat_btn load-more__btn"
            >
                <span class="load-more__btn--label">
                    {{ donat.more || $t('widget.footer') }}
                </span>
            </div>

            <lazy-widget-link-dialog v-model="link" :set="set" @update="handler" />
            <lazy-widget-goal-dialog v-model="goal" :set="set" @update="handler" />
        </material-card>
    </v-layout>
</template>

<script>
    import { clearDonat, currency, declin } from '~/assets/data/widget'

    import { clone, extendComputed } from '~/utils/widget'
    import { declination } from '~/utils/common/declination.mjs'
    import { gap } from '~/utils/common/gap.mjs'

    import { common, error } from '~/mixins/widget'

    export default {
        mixins: [error, common],

        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component')
        },
        filters: {
            humans(v, isRu) {
                return `${v} ${declination(v, declin.humans[isRu ? 'ru' : 'en'])}`
            },

            gap
        },
        computed: {
            ...extendComputed('donation'),

            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            options() {
                const min = 0,
                    max = this.donat.goal || 1000,

                    backgroundColor = this.donat.funded < max
                        ? '#5181b8'
                        : '#4BB34B'

                return {
                    dotSize: 10,
                    interval: 1,
                    width: 'auto',
                    height: 4,
                    duration: .5,
                    processStyle: { backgroundColor },
                    useKeyboard: true,
                    clickable: true,
                    tooltip: 'none',
                    min,
                    max
                }
            },
            currDecline()
            {
                let lang = this.isRu ? 'ru' : 'en',
                    decl = declin.currency[lang][this.currency],
                    goal = this.donat.goal

                if (Array.isArray(decl)) {
                    decl = `${declination(goal, decl)}`
                }

                return decl || `${this.sign}`
            },
            sign() {
                return currency.find(v => v.id === this.currency).sign
            },
            isRu() {
                return this.$i18n.locale === 'ru'
            },
            currency: {
                get() {
                    return this.donat.currency || 'RUB'
                },
                set(v) {
                    this.donat.currency = v
                }
            },
            total: {
                get() {
                    const left = ['USD','EUR','GBP'].includes(this.currency),
                        sign = left ? this.sign : this.currDecline

                    return left
                        ? `${sign} ${gap(this.donat.goal)}`
                        : `${gap(this.donat.goal)} ${sign}`
                },
                set(v) {
                    this.donat.goal = v
                }
            },
            backers: {
                get() {
                    return this.donat.funded ? this.donat.backers || 1 : 0
                },
                set(v) {
                    this.donat.backers = this.donat.funded ? v : 0
                }
            }
        },
        watch: {
            text() {
                this.$emit('update')
            },
            donat: {
                deep: true,
                handler(v) {
                    this.stop || (this.value = clone(v))
                }
            }
        },
        data: () => ({
            handler: () => {},

            tools: [
                { icon: 'mdi-currency-rub', module: 'Output', cmp: 'widget-output' },
                { icon: 'mdi-credit-card', module: 'Invoice', cmp: 'widget-invoice' }
             // { icon: 'mdi-cogs', module: 'Settings', cmp: null }
            ],

            donat: clearDonat(),
            human: 'male',

            goal: false,
            link: false,
            text: false,
            stop: false,

            set: {}
        }),
        methods: {
            clickOutside()
            {
                this.text = false
            },
            assignEntity(entity)
            {
                this.human = entity

                this.stop = true
                this.donat = clone(this.value)
                this.stop = false
            },
            goalDialog()
            {
                this.set = { goal: true, value: this.donat.goal }

                this.handler = set => {
                    this.goal = false

                    if (!set) return

                    if (set.value < this.donat.funded) {
                        this.donat.funded = set.value
                    }

                    this.currency = set.id
                    this.total = set.value
                }

                this.goal = true
            },
            backersDialog()
            {
                this.set = { goal: false, value: this.backers }

                this.handler = set => {
                    this.goal = false

                    set && (this.backers = set.value)
                }

                this.goal = true
            },
            openDialog(value, { name, link, ln = 100, both = false })
            {
                value || (value = this.donat)

                const vname = name ? value[name] : false,
                    vlink = link ? value[link] : false

                this.set = { name: vname, link: vlink, ln, both }

                this.handler = set => {
                    this.link = false

                    if (set.close) return

                    name && (value[name] = set.name)
                    link && (value[link] = set.link)
                }

                this.link = true
            },
            clear()
            {
                this.text = false
            }
        },
        mounted()
        {
            import(/* webpackChunkName: "slider" */ 'vue-slider-component/theme/default.css')

            this.$emit('update')
        },
        created()
        {
            this.donat = clone(this.value)

            this.clear()
        }
    }
</script>

<style lang="scss" scoped>
    .widget-donation {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 15px 10px;

                .module-body__donation {
                    .vue-slider {
                        padding: 11px 0 13px !important;
                    }
                    .module-body__donation-content {
                        display: flex;

                        .v-input, .v-input__control > .v-input__slot input {
                            padding: 0;
                        }
                        .module-body__donation--text {
                            line-height: 26px;
                            font-weight: 400;
                            font-size: 19px;

                            -webkit-font-smoothing: subpixel-antialiased;
                                      -moz-osx-font-smoothing: grayscale;
                        }
                    }
                    .module-body__donation-data {
                        float: left;
                        letter-spacing: -.1px;
                        line-height: 17px;
                        font-size: 13px;

                        cursor: pointer;

                        & + .module-body__donation-data {
                            margin-left: 20px;
                        }
                        b {
                            font-weight: 500;
                            -webkit-font-smoothing: subpixel-antialiased;
                                           -moz-osx-font-smoothing: auto;
                        }
                        .num_delim {
                            font-size: 60% !important;
                            vertical-align: top !important;
                            line-height: 60%;
                        }
                        .module-body__donation--desc {
                            display: block;
                            padding-top: 2px;

                            line-height: 15px;
                            font-size: 12px;
                            color: #828282;
                        }
                    }
                    .module-body__donation-button {
                        margin: 2px 0;
                        float: right;

                        text-transform: unset;
                        border-radius: 4px;
                        border: 0;

                        background-color: #5181b8 !important;
                        color: #fff;

                        &:hover {
                            background-color: #5b88bd !important;
                        }
                    }
                }
            }
        }
        &.theme--dark {
            .widget-header {
                color: #7a7a7a;

                ::v-deep .header-tools {
                    .v-btn.v-btn--icon {
                        color: #7a7a7a;
                    }
                }
            }
            ::v-deep .v-card__text {
                .module-header .module-header__top-label {
                    color: #7a7a7a;
                }
                .load-more__btn {
                    border-top: 1px solid #424242;
                    background-color: #1e1e1e;
                    color: #7a7a7a;

                    &:hover {
                        background-color: #424242;
                    }
                }
            }
        }
    }
    @media (max-width: 390px) {
        .widget-donation {
            ::v-deep .v-card__text {
                .module-body .module-body__donation {
                    .module-body__donation-data {
                        float: unset;

                        .module-body__donation--desc {
                            display: inline;
                        }
                        & + .module-body__donation-data {
                            margin-left: 0;
                        }
                    }
                    .module-body__donation-button {
                        margin: 10px 0 0 0;
                    }
                }
            }
        }
    }
    @media (max-width: 240px) {
        .widget-donation {
            ::v-deep .v-card__text {
                .module-body .module-body__donation {
                    .module-body__donation-button {
                        margin: 10px 0 0 !important;
                        float: unset;
                        width: 82%;
                    }
                }
            }
        }
    }
</style>
