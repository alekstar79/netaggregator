<template>
    <section v-scroll="onScroll" class="pricing-one" :class="{ smallscreen }" id="pricing">
        <div class="container">
            <div class="block-title text-center">
                <span class="block-title__bubbles" />
                <p>{{ $t('zimed.pricing_tables') }}</p>
                <h3>{{ $t('zimed.choose_plan') }}</h3>
            </div>

            <ul class="switch-toggler-list list-inline text-center" id="switch-toggle-tab">
                <li @click="pState || switcher()" class="month" :class="{ active: pState }">
                    <v-tooltip :disabled="mobile" attach="#pricing" nudge-bottom="10px" left offset-overflow>
                        <template #activator="{ on, attrs }">
                            <v-avatar v-bind="attrs" v-on="on" tile>
                                <lazy-core-logo fill="#00479C" />
                            </v-avatar>
                        </template>

                        <template #default>
                            <div v-html="internalAvailable" />
                        </template>
                    </v-tooltip>
                </li>

                <li>
                    <label @click="switcher" class="switch" :class="`${pState ? 'on' : 'off'}`">
                        <span class="slider round" />
                    </label>
                </li>

                <li @click="pState && switcher()" class="year" :class="{ active: !pState }">
                    <v-tooltip :disabled="mobile" attach="#pricing" nudge-bottom="10px" right offset-overflow>
                        <template #activator="{ on, attrs }">
                            <v-avatar v-bind="attrs" v-on="on" width="58" tile>
                                <lazy-core-yookassa />
                            </v-avatar>
                        </template>

                        <template #default>
                            <div v-html="externalAvailable" />
                        </template>
                    </v-tooltip>
                </li>
            </ul>

            <div class="tabed-content">
                <div id="month" ref="month" :style="mStyle">
                    <div class="row">
                        <div v-for="({ price, name, icon /*, fade */ }, i) in monthly"
                            :class="{ [fade]: true, upside: settings && name === 'custom_pack' }"
                            class="col-lg-4 wow card-box"
                            data-wow-duration="1500ms"
                            :key="i"
                            v-wow
                        >
                            <div class="pricing-one__single" :class="{ flipper: name === 'custom_pack' }" ref="block">
                                <div class="pricing-one__inner" :class="{ front: name === 'custom_pack' }">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="294" class="pricing-one__line">
                                        <defs>
                                            <pattern id="hatch-shape-4" width="5" height="5" patternUnits="userSpaceOnUse">
                                                <line stroke="#b8b8b8" stroke-width="1" x1="0" y1="0" x2="0" y2="5" />
                                            </pattern>
                                        </defs>

                                        <path fill="url(#hatch-shape-4)" stroke="none" transform="rotate(3,100,190)" d="m5.154637,80.231226c0,0 -9.730671,-25.563857 11.92188,-52.604741c13.942685,-20.1427 32.722293,-27.738811 58.432669,-22.723429c8.667515,1.769177 23.795078,11.621415 30.433682,27.998511c4.203909,17.594423 7.13773,35.967945 18.657884,52.349103c9.897024,13.524488 20.556925,18.921311 32.064919,19.87894c17.598784,0.953569 34.743094,-0.969811 52.751715,-10.144388c20.029426,-14.056065 41.243718,-8.667364 51.128586,-4.057755c19.217863,9.88469 29.476027,29.475535 29.622117,52.345043c2.580785,31.796569 -7.044391,48.952758 -23.941163,63.706758c-19.737249,14.754 -35.043377,14.056062 -53.157498,6.086633c-21.36038,-10.404082 -34.637593,-15.565551 -55.592192,-12.173266c-15.273645,2.174959 -26.927726,12.027184 -32.202897,24.606225c-8.103487,15.829306 -2.467124,27.621159 -16.085211,47.621818c-15.695644,14.721517 -30.157769,16.068696 -50.057322,16.490713c-35.30307,-1.217327 -47.444113,-29.585068 -46.518895,-56.66249c1.339108,-23.323929 15.647003,-41.486458 40.537706,-51.906783c20.820718,-14.453717 13.699162,-39.133014 4.110521,-45.889179c-7.559729,-8.793164 -20.451419,-8.63082 -30.466111,-17.001967c-16.95353,-12.48575 -19.209749,-27.418309 -21.64039,-37.919746z" />
                                    </svg>

                                    <v-icon>{{ icon }}</v-icon>
                                    <h3>{{ $t(`zimed.${name}`) }}</h3>

                                    <template v-if="price === 'discount'">
                                        <p>{{ $t('zimed.configurable') }}</p>
                                    </template>
                                    <template v-else>
                                        <p>{{ $t(`zimed.${price}`) }}</p>
                                    </template>

                                    <client-only>
                                        <template v-if="name === 'custom_pack'">
                                            <lazy-zimed-pricing-list v-model="customServices" type="monitor" />
                                        </template>
                                        <template v-else-if="name === 'basic_pack'">
                                            <lazy-zimed-pricing-list v-model="basicServices" type="monitor" />
                                        </template>
                                        <template v-else>
                                            <lazy-zimed-pricing-list v-model="trialServices" type="monitor" />
                                        </template>
                                    </client-only>

                                    <span class="thm-btn pricing-one__btn"
                                        :class="{ disabled: name === 'trial_pack' && trialHasBeenInstalled }"
                                        :disabled="name === 'trial_pack' && trialHasBeenInstalled"
                                        @click="_self[name]"
                                    >
                                        {{ $t('zimed.choose') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <payment-groups-list v-model="showTrialDialog" @choose="applyTrialSettings" />
        <payment-groups-list v-model="showBasicDialog" @choose="applyBasicSettings" />
        <payment-custom v-model="showCustomDialog" @apply="applyCustomSettings" />
    </section>
</template>

<script>
    import { declination } from '~/utils/common/declination.mjs'
    import { getCoords } from '~/utils/common/coords.mjs'
    import { _crpt } from '~/utils/common/crpt.mjs'
    import { running } from '~/utils/callbacks.mjs'

    import { login } from '~/mixins/common'
    import { wow } from '~/directives/wow'

    const external = ['apple_pay','google_pay','bank_cards','yoomoney','webmoney','qiwi_wallet','terminals','tinkoff'],
        months = locale => locale === 'ru' ? ['месяц','месяца','месяцев'] : ['month','months','months'],
        groups = locale => locale === 'ru' ? ['группа','группы','групп'] : ['group','groups','groups']

    /* function log(...args)
    {
        try {

            const style = args.pop()

            args.forEach(txt => {
                console.log(`%c${txt}`, style)
            })

        } catch (e) {
        }
    } */

    /**
    * Flipped card
    * @see https://codepen.io/kocsten/pen/Lvmapp
    * @see https://convertstring.com/EncodeDecode/HexEncode
    */
    export default {
        mixins: [login],

        directives: {
            wow
        },
        filters: {
            month(n, self) {
                return `${n} ${declination(n, months(self.$store.state.app.locale))}`
            },
            group(n) {
                return `${n} ${declination(n, groups(self.$store.state.app.locale))}`
            }
        },
        computed: {
            pState: {
                set(pState) {
                    this.$store.commit('app/set', { pState })
                },
                get() {
                    return this.$store.state.app.pState
                }
            },
            mStyle: {
                set(mStyle) {
                    this.$store.commit('app/set', { mStyle })
                },
                get() {
                    return this.$store.state.app.mStyle
                }
            },
            internalAvailable() {
                const avl = external.slice(0, 4).reduce((a, p) => `${a}<p>- ${this.$t(`payment.${p}`)}</p>`, '')

                return `<h4>${this.$t('payment.internal')}</h4><br><p>${this.$t('payment.available')}:</p>${avl}`
            },
            externalAvailable() {
                const avl = external.reduce((a, p) => `${a}<p>- ${this.$t(`payment.${p}`)}</p>`, '')

                return `<h4>${this.$t('payment.external')}</h4><br><p>${this.$t('payment.available')}:</p>${avl}`
            },
            confirmation() {
                const { user, vkapp } = this.$store.state.app,
                    user_id = user?.id ? `_${user?.id}` : ''

                return this.pState
                    ? { type: 'embedded' }
                    : {
                        type: 'redirect',
                        return_url: vkapp
                            ? `https://vk.com/services?w=app7185564${user_id}`
                            : window.location.toString().replace(/\/$/, '')
                    }
            },
            trialHasBeenInstalled() {
                return this.$store.state.app.subscribe?.trial
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            smallscreen() {
                // const { window: size } = this.$store.state.app

                return this.mobile

                /* return size
                    ? this.mobile && size.diagonal < 927
                    : this.mobile */
            },
            color() {
                return this.$store.state.app.color
            }
        },
        data: () => ({
            monthly: [
                { name: 'trial_pack',  icon: 'mdi-radiobox-blank', price: 'trial',    fade: 'fadeInLeft' },
                { name: 'basic_pack',  icon: 'mdi-heart-outline',  price: 'basic',    fade: 'fadeInLeft' },
                { name: 'custom_pack', icon: 'mdi-star-outline',   price: 'discount', fade: 'fadeInUp'   }
            ],

            checkoutEvents: ['modal_close', 'complete', 'fail'],
            customServices: ['chatbot','stream','widget','cover','designer'],
            trialServices: ['chatbot','stream','widget','cover','designer'],
            basicServices: ['widget','cover','designer'],

            showCustomDialog: false,
            showBasicDialog: false,
            showTrialDialog: false,
            cardDialog: false,
            settings: false,

            checkout: null,
            observer: null,

            min: 0,
            max: 0
        }),
        watch: {
            '$store.state.app.window': 'positioning'
        },
        methods: {
            userIdIfNecessary()
            {
                return this.$store.state.app.vkapp ? { uid: this.$store.state.app.user?.id } : {}
            },
            selfAuthorize()
            {
                const checker = (_, i) => this.$store.state.app.user || i > 90,
                    error = this.$t('payment.auth_error')

                return new Promise((resolve, reject) => {
                    if (this.$store.state.app.user) return resolve()

                    this.auth().then(() => running(checker))
                        .then(() => this.$store.state.app.user || throw new Error(error))
                        .then(resolve)
                        .catch(reject)
                })
            },
            async paymentFinished(content)
            {
                this.$bus.$emit('snack', { content, color: 'success' })

                await this.$store.dispatch('app/settingsLoad')

                this.$bus.$emit('settings:reload', 'login')
            },
            widget(data)
            {
                const self = this

                /**
                * @see https://yookassa.ru/developers/payment-forms/widget/additional-settings/separate-payment-methods
                * payment methods: apple_pay, google_pay, bank_card, yoo_money, sberbank
                */
                this.checkout = new window.YooMoneyCheckoutWidget({
                    confirmation_token: data.confirmation.confirmation_token,
                    customization: {
                        modal: true
                    },

                    error_callback(error)
                    {
                        self.$bus.$emit('snack', { content: error, color: 'error', raw: true })
                    }
                })

                this.checkoutEvents.forEach(event => {
                    this.checkout.on(event, this.modalControll.bind(this, event, data))
                })

                // const style = 'color:#00f;font-family:monospace;font-size:1.2em;'
                /* log("Yookassa's shit is coming out now!",
                    '↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓',
                    style
                ) */

                this.checkout.render()
                    /* .then(() => running((_, i) => i >= 750))
                    .then(() => {
                        log('↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑',
                            "And here's the promised shit!",
                            style
                        )
                    }) */
            },
            async processing({ payment })
            {
                let error = this.$t('payment.procedure_error')

                try {

                    await this.selfAuthorize()

                    const { data } = await this.$axios.post('/payment/create', { payment })

                    data.confirmation || (data.confirmation = {})

                    switch (true) {
                        case 'acknowledged' in data.confirmation:
                            return await this.paymentFinished('payment.thank_you')

                        case 'confirmation_token' in data.confirmation:
                            return this.widget(data)

                        case 'confirmation_url' in data.confirmation:
                            window.open(data.confirmation.confirmation_url, '_parent')
                            return
                    }

                } catch (e) {
                    error = e.message
                }

                this.$bus.$emit('snack', { content: error, color: 'error', raw: true })

                this.checkout?.destroy()
            },
            applyBasicSettings({ id })
            {
                this.processing({
                    payment: _crpt({
                        confirmation: this.confirmation,
                        ...this.userIdIfNecessary(),
                        ...{ widget: { [id]: 1 }, cover: { [id]: 1 }, designer: 1, amount: 240 },                                                                                                   // features
                        pack: 'basic'
                    })
                })
            },
            async basic_pack()
            {
                try {

                    await this.selfAuthorize()

                    this.showBasicDialog = true

                } catch (e) {
                }
            },
            /**
            * @maybe consider data encryption
            * @see https://github.com/travist/jsencrypt
            * @see https://sohabr.net/habr/post/325500
            * @see https://question-it.com/questions/1515079/kak-zashifrovat-dannye-v-javascript-i-rasshifrovat-v-php
            * @example:
            *
            *   let decripted = enc_string.slice(0, -2)
            *          .split(/[a-z]+/)
            *          .filter(Boolean)
            *          .map(v => String.fromCharCode(v ^ 3))
            *          .join('')
            */
            applyCustomSettings(features)
            {
                this.processing({
                    payment: _crpt({
                        confirmation: this.confirmation,
                        pack: features.total === 0 ? 'zero' : 'custom',
                        ...this.userIdIfNecessary(),
                        ...features
                    })
                })
            },
            async custom_pack()
            {
                try {

                    await this.selfAuthorize()

                    this.showCustomDialog = true

                } catch (e) {
                }
            },
            async applyTrialSettings({ id: gid })
            {
                try {

                    await this.selfAuthorize()

                    if (this.$store.state.app.subscribe?.trial) return

                    const { data } = await this.$axios.post('/payment/trial', { ...this.userIdIfNecessary(), gid })

                    if (data.confirmation) {
                        return await this.paymentFinished('payment.thank_you')
                    }

                } catch (e) {
                }

                this.$bus.$emit('snack', { content: 'payment.trial_error', color: 'error' })
            },
            async trial_pack()
            {
                try {

                    await this.selfAuthorize()

                    this.showTrialDialog = !this.$store.state.app.subscribe?.trial

                } catch (e) {
                }
            },
            async modalControll(state, { confirmation })
            {
                this.checkout?.destroy()

                if (state !== 'complete') return

                try {

                    await new Promise(resolve => setTimeout(resolve, 200))

                    const { data } = await this.$axios.post('/payment/acknowledge', {
                        ...this.userIdIfNecessary(),
                        ...confirmation
                    })

                    if (data && data.object?.status === 'succeeded') {
                        return await this.paymentFinished('payment.thank_you')
                    }

                } catch (e) {
                }

                this.$bus.$emit('snack', { content: 'payment.procedure_error', color: 'error' })
            },
            positioning()
            {
                const { top, height } = getCoords(this.$el)

                this.max = top + height
                this.min = top
            },
            emitVisibility(data)
            {
                this.$bus.$emit('scroll:goal', { id: 'pricing', ...data })
            },
            onScroll(event)
            {
                const offsetTop = event.target.scrollingElement.scrollTop

                if (offsetTop > this.min && offsetTop < this.max) {
                    this.emitVisibility({ min: this.min, max: this.max })
                }
            },
            setObserver()
            {
                this.observer = new MutationObserver(mutationRecords => {
                    mutationRecords.forEach(r => {
                        let rem = r.removedNodes[0],
                            add = r.addedNodes[0],

                            modalWidget,
                            modal3ds,

                            container

                        if ((!add || add.nodeName.toLowerCase() !== 'div') &&
                            (!rem || rem.nodeName.toLowerCase() !== 'div')) {
                            return
                        }

                        modalWidget = document.getElementById('modal-widget')
                        modal3ds = document.getElementById('modal-3ds')

                        if (modalWidget) {
                            container = modalWidget.querySelector('.checkout-modal__container')

                            if (!container.querySelector('#security')) {
                                container.insertAdjacentHTML('afterbegin', `
                                    <p id="security" style="display: flex; justify-content: center; color: rgba(255,255,255,.5);">
                                        Данные передаются по безопасному соединению.
                                    </p>
                                `)
                            }
                        }
                        if (modal3ds && container) {
                            container.style.display = 'none'

                        } else if (container) {
                            container.style.display = 'block'
                        }
                    })
                })

                this.observer.observe(document.body, {
                    childList: true,
                    subtree: true
                })
            },
            switcher()
            {
                this.pState = !this.pState
            }
        },
        mounted()
        {
            this.$nextTick().then(this.positioning).then(this.setObserver)
        },
        beforeDestroy()
        {
            this.observer?.disconnect()
        }
    }
</script>

<style lang="scss" scoped>
    // https://www.internet-technologies.ru/articles/kak-nastroit-vysotu-stroki-v-css.html
    @function calculateTypeOffset($lh, $fontSize, $descenderHeightScale) {
        $lineHeightScale: $lh / $fontSize;
        @return ($lineHeightScale - 1) / 2 + $descenderHeightScale;
    }

    @mixin basekick($typeSizeModifier, $baseFontSize, $descenderHeightScale, $typeRowSpan, $gridRowHeight, $capHeight) {
        $fontSize: $typeSizeModifier * $baseFontSize;
        $lineHeight: $typeRowSpan * $gridRowHeight;
        $typeOffset: calculateTypeOffset($lineHeight, $fontSize, $descenderHeightScale);
        $topSpace: $lineHeight - $capHeight * $fontSize;
        $heightCorrection: 0;

        @if $topSpace > $gridRowHeight {
            $heightCorrection: $topSpace - ($topSpace % $gridRowHeight);
        }

        $preventCollapse: 1;

        font-size: #{$fontSize}px;
        line-height: #{$lineHeight}px;
        transform: translateY(#{$typeOffset}em);
        padding-top: #{$preventCollapse}px;
        &::before {
            content: '';
            margin-top: #{-($heightCorrection + $preventCollapse)}px;
            display: block;
            height: 0;
        }
    }

    .pricing-one {
        .container {
            .tabed-content .row {
                .card-box {
                    transform-style: preserve-3d;
                    perspective: 1700px;
                    min-height: 709px;

                    .pricing-one__single {
                        height: 100%;

                        .v-icon.mdi-radiobox-blank,
                        .v-icon.mdi-heart-outline,
                        .v-icon.mdi-star-outline {
                            font-size: 4em;

                            display: initial;
                            background: -webkit-linear-gradient(60deg, #ff0080, #ff0);
                            background: linear-gradient(60deg, #ff0080, #ff0);
                            -webkit-text-fill-color: transparent;
                            -webkit-background-clip: text;
                        }
                    }
                    .flipper {
                        position: relative;
                        transform-style: preserve-3d;
                        transition: .7s linear;

                        .front, .back {
                            backface-visibility: hidden;
                            box-sizing: border-box;
                            position: absolute;
                            left: 0;
                            top: 0;

                            height: 100%;
                            width: 100%;
                        }
                        .front {
                            transform: rotateY(0deg);

                            ::v-deep .v-btn {
                                position: absolute;
                                right: 5px;
                                top: 5px;

                                z-index: 9;

                                .v-btn__content {
                                    margin-top: unset;
                                }
                            }
                        }
                        .back {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            transform: rotateY(-180deg);

                            .layout .col {
                                max-width: 167px;

                                ::v-deep .v-input {
                                    .v-select__selections span {
                                        margin-top: 4px;
                                        font-size: 16px;
                                    }
                                    .v-input__control span {
                                        margin-top: 4px;
                                    }
                                }
                            }
                            .thm-btn.pricing-one__btn {
                                align-self: center;
                            }
                        }
                    }
                    &.upside .flipper {
                        transform: rotateY(180deg);
                    }
                }
            }
            .list-unstyled {
                padding-left: unset;
                list-style: none;
            }
            .list-inline.switch-toggler-list {
                .v-avatar {
                    margin: unset;
                    cursor: pointer;
                }
            }
        }
        .v-tooltip__content div {
            white-space: pre-wrap;
            padding: 5px 0;

            ::v-deep h4 {
                @include basekick(2, 6, .1, 6, 4, .75);
            }
            ::v-deep p {
                @include basekick(2, 6, .1, 3, 4, .75);
                margin-bottom: 8px;

                &:last-of-type {
                    margin-bottom: 0;
                }
            }
        }
        &.smallscreen {
            padding-bottom: 0;
        }
    }
    .pricing.v-menu__content {
        .v-list.v-select-list .v-list-item span {
            display: block;
            font-size: 13px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
</style>
