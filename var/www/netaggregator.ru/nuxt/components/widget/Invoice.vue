<template>
    <v-card class="panel-payouts" flat>
        <v-card-text class="panel-payouts__card">
            <div class="payouts__reqs">
                <v-layout class="payouts__reqs-list" wrap>
                    <div v-for="(a, i) in accounts" :key="`invoice-${a.icon}-${i}`" class="payouts__reqs-list--item">
                        <div class="payouts__icon" :class="a.icon" />

                        <div class="payouts__data">
                            <div class="payouts__data--title">
                                {{ a.title }}
                            </div>
                            <div class="payouts__data--value">
                                {{ a | format }}
                            </div>
                        </div>

                        <div @click="del(a)" class="payouts__del">
                            <v-icon color="#aaa" dense>mdi-close</v-icon>
                        </div>
                    </div>

                    <div @click="choose = true" class="payouts__reqs-list--add">
                        <v-icon>mdi-plus</v-icon> {{ $t('widget.add_invoice') }}
                    </div>
                </v-layout>
            </div>

            <div v-if="choose" class="payouts__request">
                <div class="payouts__reqs-add--title">
                    {{ $t('widget.select_payment') }}
                </div>

                <div class="payouts__reqs-add--ps">
                    <div v-for="p in Object.keys(payment)"
                        class="payouts__ps-icon"
                        :class="payment[p].icon"
                        :key="p"
                        @click="type = p"
                    />
                </div>
            </div>
            <div v-else-if="input" class="payouts__request">
                <div class="payouts__reqs-add--title">
                    {{ ps && ps.descr }}
                </div>

                <v-layout class="payouts__reqs-add--input" row>
                    <div class="payouts__ps-icon" :class="ps && ps.icon" />

                    <v-text-field v-model="value"
                        class="payouts__input"
                        :label="ps && ps.label"
                        :mask="ps && ps.mask"
                        :color="color"
                        height="40px"
                        hide-details
                        outline
                    />
                    <v-btn class="payouts__reqs-btn"
                        :color="color"
                        @click="add"
                        v-text="'+'"
                        dark
                        fab
                    />
                </v-layout>
            </div>
            <div v-else class="payouts__request">
                <div class="payouts__request--empty">
                    {{ $t('widget.payout_request') }}
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import { payment } from '~/assets/data/widget'

    let filter = ($1, $2) => $1.filter(x => !$2.includes(x)),
        o = []

    export default {
        filters: {
            format(account) {
                return ['mobile','qiwi'].includes(account.type) ? '+' + account.value : account.value
            }
        },
        computed: {
            accounts: {
                set(accounts) {
                    this.$store.commit('widget/set', { accounts })
                },
                get() {
                    return this.$store.state.widget.accounts
                }
            },
            started: {
                set(started) {
                    this.$store.commit('widget/set', { started })
                },
                get() {
                    return this.$store.state.widget.started
                }
            },
            mobile() {
                return !!(this.$BROWSE || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            ps() {
                return payment[this.type] || {}
            }
        },
        watch: {
            accounts: {
                deep: true,
                handler(n)
                {
                    if (this.started) this.onChange(n)

                    this.started = true
                }
            },
            type() {
                this.choose = false
                this.input = true
            }
        },
        data: () => ({
            type: 'mobile',
            value: '',

            choose: false,
            input: false,

            payment
        }),
        methods: {
            onChange(n)
            {
                const action = n.length > o.length ? 'Add' : 'Del';

                (action === 'Add' ? filter(n, o) : filter(o, n))
                    .forEach(this[`action${action}`])
            },
            actionAdd({ type, value })
            {
                // console.log(`add ${type} ${value}`)
            },
            actionDel({ type, value })
            {
                // console.log(`del ${type} ${value}`)
            },
            toggle()
            {
                return new Promise(resolve => {
                    this.type = null
                    setTimeout(resolve)
                })
            },
            add()
            {
                const { type, value, ps: { title, icon } } = this

                if (!this.ps || !value.length) {
                    return this.toggle().then(() => { this.input = false })
                }
                if (!this.ps.valid(value)) {
                    return this.$bus.$emit('snack', {
                        content: 'widget.invalid_value',
                        color: 'error'
                    })
                }

                o = Array.from(this.accounts)

                this.accounts.push({ type, value, title, icon })
                this.value = ''

                this.toggle().then(() => {
                    this.input = false
                })
            },
            del(account)
            {
                o = Array.from(this.accounts)

                this.accounts = this.accounts.filter(a => a !== account)
            }
        }
        /* async fetch()
        {
            this.started || (this.accounts = await this.$axios.$get('/donat/accounts'))
        } */
    }
</script>

<style lang="scss" scoped>
    .panel-payouts {
        background: transparent;

        .panel-payouts__card {
            box-sizing: border-box;
            padding: 0;

            .payouts__reqs {
                padding: 15px 0;
            }
            .payouts__icon, .payouts__ps-icon {
                display: inline-block;
                margin: 0 10px 0 0;
                height: 50px;
                width: 50px;

                vertical-align: middle;

                background: url(/img/pricing/pay.png);
                background-size: cover;
            }
            .payouts__icon-qiwi {
                background-position: 0 0;
            }
            .payouts__icon-webmoney {
                background-position: 25% 0;
            }
            .payouts__icon-yandex {
                background-position: 50% 0;
            }
            .payouts__icon-card {
                background-position: 75% 0;
            }
            .payouts__icon-mobile {
                background-position: 100% 0;
            }
            .payouts__reqs-list {
                .payouts__reqs-list--add,
                .payouts__reqs-list--item {
                    box-sizing: border-box;
                    position: relative;
                    padding: 10px;
                    width: 50%;

                    border-radius: 5px;

                    white-space: nowrap;
                    align-self: center;
                    overflow: hidden;

                    &:hover {
                        background-color: #fafbfc;
                        cursor: pointer;

                        .payouts__del {
                            display: block;
                        }
                    }
                    .payouts__data, .payouts__icon {
                        display: inline-block;
                        vertical-align: middle;
                    }
                    .payouts__data--title {
                        font-size: 12px;
                    }
                    .payouts__data--value {
                        font-weight: 500;
                        font-size: 16px;
                    }
                    .payouts__del {
                        position: absolute;
                        display: none;
                        right: 5px;
                        top: 5px;

                        & > svg {
                            fill: #aaa;
                        }
                    }
                    & > svg {
                        margin-right: 18px;
                        height: 20px;

                        vertical-align: middle;
                        fill: #999;
                    }
                }
                .payouts__reqs-list--add:nth-child(2n+1) {
                    width: 100%;
                    justify-content: center;
                }
                .payouts__reqs-list--add {
                    display: flex;
                    padding: 15px;

                    line-height: 30px;
                    font-size: .9em;
                }
            }
            .payouts__request {
                padding: 25px 0;
                border-top: 1px solid #e3e4e8;

                .payouts__reqs-add--title {
                    text-align: center;
                    font-size: 14px;
                }
                .payouts__reqs-add--input {
                    display: flex;
                    align-items: center;
                }
                .payouts__reqs-btn {
                    box-shadow: unset !important;
                    margin: 0 0 0 10px;
                    padding: 0;

                    height: 45px;
                    width: 45px;

                    border-radius: 50%;
                }
                .payouts__reqs-add--ps {
                    text-align: center;
                    padding: 12px 0 0;

                    .payouts__ps-icon {
                        margin: 0 5px !important;
                        border-radius: 5px;
                        cursor: pointer;

                        &.payouts__ps-icon:hover {
                            background-color: #f0f0f0;
                        }
                    }
                }
                .payouts__request--empty {
                    padding: 17px 7px;
                    text-align: center;
                    font-weight: 400;
                    color: #7a7a7a;
                }
            }
        }
        &.theme--dark {
            .payouts__reqs-list {
                .payouts__reqs-list--add,
                .payouts__reqs-list--item {
                    color: #7a7a7a;

                    &:hover {
                        background-color: #292929;
                    }
                }
            }
            .payouts__request {
                border-top: 1px solid #424242;

                .payouts__reqs-add--ps {
                    .payouts__ps-icon {
                        &.payouts__ps-icon:hover {
                            background-color: #f0f0f0;
                        }
                    }
                }
            }
        }
    }
</style>
