<template>
    <v-dialog-patched
        v-model="show"
        @leave="leave"
        @before-leave="beforeLeave"
        @after-enter="afterEnter"
        content-class="custom__payment--dialog"
        :fullscreen="fullscreen"
        :scrollable="!loading"
        :duration="1000"
        transition="slideY"
        max-width="60%"
    >
        <template #default="dialog">
            <v-card min-height="420px" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
                <v-toolbar :color="color" max-height="64px" dark flat>
                    <v-toolbar-title v-if="!mobile">{{ $t('payment.configurator') }}</v-toolbar-title>

                    <v-spacer />

                    <v-toolbar-items>
                        <!--<div v-show="!mobile" id="vk_allow_messages_from_community" />-->
                        <v-menu v-model="menu" :close-on-content-click="false" :key="force" min-width="220px" content-class="cost-menu">
                            <template #activator="{ on, attrs }">
                                <v-btn :disabled="!Object.keys(schema).length"
                                    v-bind="attrs"
                                    v-on="on"
                                    elevation="0"
                                    outlined
                                    tile
                                >
                                    {{ $t('payment.topay') }}: {{ schema.total }}
                                </v-btn>
                            </template>

                            <v-card class="cost-calculation">
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-content class="text-center">
                                            <v-list-item-title>
                                                {{ $t('payment.cost_calculation') }}
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>

                                <v-divider />

                                <v-card-text>
                                    <v-data-table
                                        :items="payment"
                                        :headers="headers"
                                        :dense="mobile"
                                        class="elevation-0"
                                        hide-default-header
                                        hide-default-footer
                                    />
                                </v-card-text>

                                <v-card-actions class="justify-center">
                                    <v-btn @click="menu = false" color="error" text>
                                        {{ $t('payment.cancel') }}
                                    </v-btn>
                                    <v-btn @click="apply" :color="color" text>
                                        {{ $t('payment.pay') }}
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-menu>

                        <v-btn @click="toggle" elevation="0" icon>
                            <v-icon>{{ checked ? 'mdi-sync' : 'mdi-check' }}</v-icon>
                        </v-btn>
                        <v-btn @click="dialog.value = false" elevation="0" icon>
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-container v-if="groups.length">
                        <v-layout :justify-center="groups.length < 3" :justify-start="groups.length > 2" wrap>
                            <template v-for="(g, i) in groups">
                                <v-col class="card-box" :key="i" lg="4" md="4" sm="12">
                                    <div class="pricing-one__single">
                                        <div class="pricing-one__inner">
                                            <v-avatar height="100px" width="100px">
                                                <v-img :src="g.photo" />
                                            </v-avatar>

                                            <h3>{{ g.name | spoof(_self) }}</h3>

                                            <v-select
                                                v-model="g.period"
                                                :items="[1,3,6,9,12]"
                                                :label="$t('common.period')"
                                                :menu-props="{ contentClass: 'pricing' }"
                                                :item-color="color"
                                                :color="color"
                                                hide-details
                                                outlined
                                            >
                                                <template #item="{ item }">
                                                    <span>{{ item | month(_self) }}</span>
                                                </template>
                                                <template #selection="{ item }">
                                                    <span>{{ item | month(_self) }}</span>
                                                </template>
                                            </v-select>

                                            <client-only>
                                                <lazy-zimed-pricing-list
                                                    v-model="g.services"
                                                    type="custom_pack"
                                                />
                                            </client-only>
                                        </div>
                                    </div>
                                </v-col>
                            </template>
                        </v-layout>
                    </v-container>
                    <v-container v-if="!groups.length" class="empty">
                        <h3>{{ $t('common.not_managed') }}</h3>
                    </v-container>

                    <div class="footer d-flex justify-center align-center">
                        <a @click.stop.prevent="" href="https://netaggregator.ru">
                            netaggregator.ru
                        </a>
                    </div>
                </v-card-text>

                <div v-show="loading" class="loader">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                        <path fill="red" d="M21 11h-.17c-1.053 0-1.958-.669-2.357-1.644l-.021-.049c-.408-.977-.249-2.097.5-2.846l.119-.119a.999.999 0 1 0-1.414-1.414l-.119.119c-.749.749-1.869.908-2.846.5l-.049-.021C13.669 5.128 13 4.218 13 3.165v-.081C13 2.447 12.553 2 12 2s-1 .447-1 1v.036c0 1.096-.66 2.084-1.673 2.503l-.006.003a2.71 2.71 0 0 1-2.953-.588l-.025-.025a.999.999 0 1 0-1.414 1.414l.036.036a2.69 2.69 0 0 1 .583 2.929l-.027.064A2.638 2.638 0 0 1 3.085 11h-.001C2.447 11 2 11.447 2 12s.447 1 1 1h.068a2.66 2.66 0 0 1 2.459 1.644l.021.049a2.69 2.69 0 0 1-.583 2.929l-.036.036a.999.999 0 1 0 1.414 1.414l.036-.036a2.689 2.689 0 0 1 2.929-.583l.143.06A2.505 2.505 0 0 1 11 20.83v.085c0 .638.447 1.085 1 1.085s1-.448 1-1v-.17c0-1.015.611-1.93 1.55-2.318l.252-.104a2.508 2.508 0 0 1 2.736.545l.119.119a.999.999 0 1 0 1.414-1.414l-.119-.119c-.749-.749-.908-1.869-.5-2.846l.021-.049c.399-.975 1.309-1.644 2.362-1.644h.08c.638 0 1.085-.447 1.085-1s-.447-1-1-1zM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4.5a2 2 0 1 1 .001-4.001A2 2 0 0 1 14 12z" />
                    </svg>
                </div>
            </v-card>
        </template>
    </v-dialog-patched>
</template>

<script>
    import { getDiscountGroups as _dsc, components, periods } from '~/utils/discount.mjs'
    import { declination } from '~/utils/common/declination.mjs'
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { spoof } from '~/utils/common/spoof.mjs'

    import { VDialogPatched } from '~/utils/v-dialog-patch'

    /* function detailsByGroupId(data)
    {
        return data.reduce((acc, g) => ({ ...acc, [g.id]: { period: g.period, services: g.services } }), {})
    } */

    const services = checked => checked ? [] : ['chatbot','stream','widget','cover','designer'],
        discountByPeriod = Object.keys(periods).map(p => parseInt(p)).reverse()

    function titles(locale)
    {
        return locale === 'ru' ? ['месяц','месяца','месяцев'] : ['month','months','months']
    }

    function getDiscountByPeriod(pk)
    {
        discountByPeriod.some(p => {
            if (pk >= p) {
                pk *= (1 - periods[p])
                return true
            }

            return false
        })

        return pk
    }

    function detailsByServices(data, ref = 0)
    {
        let prior, designer = 0, stream = 0, raw = 0, sum = 0,

            _amount = (s, p, a) => a + components[s],
            _periods = [],
            _pk

        return (schema => {
            if (designer > 0) {
                sum += (components.designer * getDiscountByPeriod(designer))
                raw += (components.designer * designer)
                schema.designer = designer
            }
            if (stream > 0) {
                sum += (components.stream * getDiscountByPeriod(stream))
                raw += (components.stream * stream)
                schema.stream = stream
            }

            let total = sum

            switch (true) {
                case ref >= sum:
                    total = 0
                    break
                case ref < sum:
                    total -= ref
                    break
            }

            return {
                ...schema,
                amount: Math.round(sum),
                total: Math.round(total),
                raw: Math.round(raw),
                ref
            }

        })(Object.entries(
            prior = data.reduce((acc, { id, period, services }) => {
                if (services.includes('designer')) {
                    services = services.filter(s => s !== 'designer')
                    period > designer && (designer = period)
                }
                if (services.includes('stream')) {
                    services = services.filter(s => s !== 'stream')
                    period > stream && (stream = period)
                }

                return services.reduce((a, s) => ({
                    ...a,
                    [s]: {
                        ...(a[s] || {}),
                        amount: _amount(s, period, a[s]?.amount || 0),
                        [id]: period
                    }

                }), acc)

            }, {})

        ).reduce((acc, [s, { amount, ...options }]) => {
            _periods = Object.values(options)
            _pk = Math.round(_periods.reduce((a, b) => a + b, 0) / _periods.length)

            raw += _pk * acc[s].amount

            _pk = getDiscountByPeriod(_pk)

            acc[s].amount *= _pk * (1 - _dsc(_periods.length) / 100)
            acc[s].amount = Math.round(acc[s].amount)

            sum += acc[s].amount

            return acc

        }, prior))
    }

    function adduction(context)
    {
        const { groups = [] } = context.$store.state.app,
            update = context.$forceUpdate.bind(context)

        return groups.map(({ id, name, photo_50, photo_100, photo_200, photo_400 }) => {
            let group = { key: rndstring(), id, name, photo: photo_400 || photo_200 || photo_100 || photo_50, period: 1 },
                services = [],
                mark = false

            Object.defineProperty(group, 'services', {
                enumerable: true,

                get: () => services,
                set: v => {
                    services = v.includes('cover') && !mark
                        ? [...new Set([...v, 'designer'])]
                        : v

                    mark = v.includes('cover')
                    group.key = rndstring()
                    update()
                }
            })

            return group
        })
    }

    export default {
        components: {
            VDialogPatched
        },
        filters: {
            spoof,

            month(n, self) {
                return `${n} ${declination(n, titles(self.$store.state.app.locale))}`
            }
        },
        props: {
            value: {
                type: Boolean,
                default: false
            },
            params: {
                type: Object,
                default: () => ({})
            }
        },
        model: {
            event: 'input',
            prop: 'value'
        },
        computed: {
            ref() {
                return this.$store.state.app.user?.available || 0
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            payment() {
                const { raw = 0, amount = 0, ref = 0, total = 0 } = this.schema,
                    discount = raw - amount

                return [
                    { name: this.$t('payment.cost'),      amount: raw      },
                    { name: this.$t('payment.discount'),  amount: discount },
                    { name: this.$t('payment.referrals'), amount: ref      },
                    { name: this.$t('payment.total'),     amount: total    }
                ]
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            },
            schema: {
                set(schema) {
                    this.$store.commit('custom/set', { schema })
                },
                get() {
                    return this.$store.state.custom.schema
                }
            },
            show: {
                set(value) {
                    this.$emit('input', value)
                },
                get() {
                    return this.value
                }
            }
        },
        watch: {
            value(v) {
                v && (this.loading = v) && this.init()
            },
            groups: {
                deep: true,
                handler(groups) {
                    const filtered = groups.filter(g => g.services.length)

                    this.checked = filtered.length
                    this.schema = this.checked
                        ? detailsByServices(filtered, this.ref)
                        : {}
                }
            }
        },
        data: () => ({
            headers: [
                { text: 'Section', align: 'start', value: 'name'   },
                { text: 'Amount',  align: 'end',   value: 'amount' }
            ],

            fullscreen: false,
            loading: false,
            checked: false,
            force: false,
            menu: false,

            groups: [],
            vk: null
        }),
        methods: {
            clearCallbacks()
            {
                if (window.vkAsyncInitCallbacks?.length) {
                    window.vkAsyncInitCallbacks = window.vkAsyncInitCallbacks.filter(cb => cb !== this.setAllowVkOpenApi)
                }
            },
            async init()
            {
                await this.$nextTick()

                if (!this.groups.length) {
                    this.$set(this, 'groups', adduction(this))
                }
                if (!this.vk) {
                    this.setAllowVkOpenApi()
                }

                this.loading = false
            },
            setAllowVkOpenApi()
            {
                /* try {

                    if (this.vk) return

                    this.vk = VK.Widgets.AllowMessagesFromCommunity(
                        'vk_allow_messages_from_community',
                        { height: 30 },
                        147718403
                    )

                    this.clearCallbacks()

                } catch (e) {
                } */
            },
            isChecked() {
                return this.groups.length ? this.groups.some(g => g.services.length) : false
            },
            toggle()
            {
                const checked = this.checked

                this.groups.forEach(g => {
                    g.services = services(checked)
                    g.period = checked ? 1 : 12
                })
            },
            apply()
            {
                if (this.schema.amount) {
                    this.$emit('apply', this.schema)
                    this.show = false
                }
            },
            reload()
            {
                this.force = !this.force
            },
            afterEnter()
            {
                setTimeout(() => this.fullscreen = true)
            },
            beforeLeave()
            {
                this.fullscreen = false
            },
            leave(el, done)
            {
                setTimeout(done, 1e3)
            }
        },
        created()
        {
            if (!process.browser) return

            this.setAllowVkOpenApi = this.setAllowVkOpenApi.bind(this)

            window.vkAsyncInitCallbacks || (window.vkAsyncInitCallbacks = [])

            window.vkAsyncInitCallbacks.push(this.setAllowVkOpenApi)
        },
        beforeMount()
        {
            this.$bus.$on('settings:reload', this.reload)

            if (!this.mobile) {
                this.$bus.$on('loading:finish', this.setAllowVkOpenApi)
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('loading:finish', this.setAllowVkOpenApi)
            this.$bus.$off('settings:reload', this.reload)

            this.clearCallbacks()
        }
    }
</script>

<style lang="scss">
    %ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .custom__payment--dialog .v-card {
        .v-toolbar .v-toolbar__items {
            align-items: center;

            #vk_allow_messages_from_community {
                width: 195px !important;
            }
            .v-btn {
                border-radius: 5px;
                height: 30px !important;
                margin: 0 3px;
            }
        }
        .v-card__text {
            padding: unset !important;

            .container {
                min-height: 93%;

                &.empty {
                    display: grid;
                    place-content: center;
                    height: calc(100% - 65px);
                }
                .card-box {
                    flex: 1 1 100%;

                    .pricing-one__single {
                        min-width: unset;
                        border: thin solid #3737371c;

                        .pricing-one__inner {
                            padding-bottom: unset;
                            padding-top: 30px;

                            .pricing-one__list {
                                margin-top: 46px;
                                user-select: none;

                                .v-input.v-input--checkbox {
                                    margin: 0;
                                }
                            }
                            .v-input {
                                margin: 0 34px;

                                .v-input__slot {
                                    .v-label {
                                        transform: translateY(-25px) scale(.75);
                                    }
                                    span {
                                        letter-spacing: .1em;
                                    }
                                }
                            }
                            h3 {
                                max-width: 70%;
                                margin: 34px auto;
                                font-size: 2vmax;
                                @extend %ellipsis
                            }
                        }
                    }
                    .pricing-one__single,
                    .pricing-one__single .pricing-one__inner {
                        border-radius: 10px;
                    }
                }
            }
            .footer {
                display: flex;
                min-height: 64px;
                font-size: 1.25rem;

                a,
                a:visited {
                    color: #82b1ff;
                }
            }
        }
        .loader {
            position: absolute;
            z-index: 99;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            display: grid;
            place-items: center;
            background-color: #fafbfd;
            font-size: 10rem;

            svg {
                animation: loader 1s infinite;
            }
        }
        &.theme--dark {
            .v-card__text {
                background-color: #303030;

                .container {
                    .card-box .pricing-one__single {
                        background-color: #262626;
                        border: none;

                        .pricing-one__inner {
                            background-color: unset;

                            h3 {
                                color: #aaa;
                            }
                        }
                    }
                }
                .footer {
                    a,
                    a:visited {
                        color: #aaa;
                    }
                }
            }
        }
    }
    .cost-menu .cost-calculation {
        .v-list-item__title {
            text-transform: uppercase;
        }
        .v-card__text {
            padding: 8px;

            .v-data-table--dense,
            .v-data-table--mobile {
                tr {
                    display: flex;
                    justify-content: space-around;
                    border-bottom: thin solid rgba(0,0,0,.12);

                    td {
                        border-bottom: none;
                    }
                }
            }
        }
    }
    .pricing.v-menu__content {
        .v-list.v-select-list .v-list-item span {
            display: block;
            font-size: 13px;
            @extend %ellipsis
        }
    }
    .slideY-enter-active {
        animation: slideYIn 1s ease;
    }
    .slideY-leave-active {
        animation: slideYOut 1s ease;
    }
    @keyframes slideYIn {
        from {
            opacity: 0;
            transform: translateY(-50vh);
        }
        70% {
            opacity: 1;
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideYOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        90% {
            opacity: 0;
        }
        to {
            opacity: 0;
            transform: translateY(-50vh);
        }
    }
    @media all and (min-width: 1199px) {
        .custom__payment--dialog .v-card {
            .v-card__text .container .card-box {
                .pricing-one__single {
                    .pricing-one__inner h3 {
                        font-size: 1.5vmax;
                    }
                }
            }
        }
    }
    @media all and (max-width: 1199px) {
        .custom__payment--dialog .v-card {
            .v-card__text .container .card-box {
                width: 100%;
            }
        }
    }
    @media all and (max-width: 420px) {
        .custom__payment--dialog .v-card {
            .v-card__text {
                padding: 0 0 20px !important;

                .container .card-box {
                    padding: 0;
                }
            }
        }
    }
</style>
