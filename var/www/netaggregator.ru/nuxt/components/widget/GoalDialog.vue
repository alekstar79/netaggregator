<template>
    <v-dialog v-model="proxy" content-class="goal-dialog" :fullscreen="fullscreen" max-width="350px">
        <v-card class="goal-dialog__card" :class="{ fullscreen: mobile }">
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout class="goal-dialog__btn-wrapper" justify-start>
                    <v-btn @click="close()" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <v-btn @click="close(true)" icon>
                        <v-icon>mdi-check</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs class="goal-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="close()" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <v-tab @click="close(true)" :ripple="false">
                        <v-icon :color="color">mdi-check</v-icon>
                    </v-tab>
                </v-tabs>
            </template>

            <v-card-text class="goal-dialog__card-pane">
                <v-layout column>
                    <v-flex xs12>
                        <v-text-field
                            v-model="amount"
                            :label="$t(`widget.${set.goal ? 'amount' : 'quantity'}`)"
                            :rules="[rule]"
                            :color="color"
                            :error="big"
                        />
                    </v-flex>
                    <v-flex v-if="set.goal" xs12>
                        <lazy-helper-slide-select
                            v-model="selected"
                            :options="currency"
                            :optionHeight="24"
                            :getLabel="v => v.desc"
                            :getKey="v => v.id"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import { currency } from '~/assets/data/widget'

    export default {
        props: ['value','set'],

        model: {
            event: 'input',
            prop: 'value'
        },
        data: () => ({
            wrong: false,
            big: false,

            selected: { id: 'RUB', sign: '₽' },
            amount: 0,

            currency
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
            smallscreen() {
                const { window: size } = this.$store.state.app

                return size && size.diagonal < 927
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            fullscreen() {
                return this.mobile || this.smallscreen
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'start',

            set({ value }) {
                this.amount = value
            }
        },
        methods: {
            rule(v)
            {
                v = Number(v)

                const isBig = v => (this.big = !!(v && v > 99999999)),
                    isWrong = v => (this.wrong = isNaN(v))

                switch (true) {
                    case isWrong(v): return this.$t('widget.char_value')
                    case isBig(v): return this.$t('widget.amount_over')
                }

                return true
            },
            setProps()
            {
                this.amount = this.set.value
            },
            start(v)
            {
                v ? this.setProps() : this.$emit('input', v)
            },
            close(apply = false)
            {
                if (this.wrong || this.big) return

                const value = Math.abs(this.amount)

                this.$emit('update', apply ? { ...this.selected, value } : null)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .goal-dialog .v-card.goal-dialog__card {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .v-card__text.goal-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        .goal-dialog__btn-wrapper {
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
        .goal-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .v-card__text.goal-dialog__card-pane {
            padding: 15px;
        }
    }
    @media all and (max-width: 320px) {
        .goal-dialog {
            margin: 0 !important;
            max-height: 100vh !important;
            height: 100%;
            width: 100%;
        }
    }
</style>
