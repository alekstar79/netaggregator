<template>
    <section v-scroll="onScroll" class="banner-one" :class="{ mobile, gradient }" id="banner">
        <!--<svg width="421" height="461" xmlns="http://www.w3.org/2000/svg" class="banner-one__shape-1">
            <path fill="none" stroke="#fff" d="m0.0105,2.63638l2.264692,0.136203l-0.325034,-0.128049c71.102145,-10.932723 123.634065,107.23601 171.363808,52.399993c22.37763,-33.00503 59.543973,-16.192258 50.437637,17.544853c-9.810561,41.48359 24.156072,57.526565 41.254474,60.131706c28.366008,4.013592 46.203094,-8.948095 53.884894,-34.006423c6.977575,-34.213258 28.026858,-44.935771 55.259526,-40.574206c20.89465,3.65733 37.693954,10.899941 44.730623,41.160243c0.698641,33.781429 -15.359334,43.89512 -36.35313,48.09092c-18.88112,4.19581 -34.96504,8.39161 -44.06645,22.53845c-9.10141,14.14684 -12.57691,35.50351 -1.3986,57.34266c11.1783,21.83915 34.27624,33.40561 33.56643,79.02098c-0.7098,45.61537 -31.45802,86.55246 -49.65035,97.20279c-18.19232,10.65034 -44.74474,34.80422 -119.58042,13.28672c-74.83568,-21.5175 -111.87761,-2.25873 -124.47552,1.3986c-12.59792,3.65732 -76.21328,40.39862 -76.22378,39.86014c-0.0105,-0.53848 -383.20628,-304.35663 -0.6888,-455.40558z" />
        </svg>-->

        <!--<svg width="170" height="128" xmlns="http://www.w3.org/2000/svg" class="banner-one__shape-2">
            <path fill="url(#shape-1)" stroke="none" d="m16.655945,112.053785c-14.955116,-12.73978 -14.539696,-28.541484 -13.293436,-37.605334c1.24626,-9.06385 5.815878,-19.477634 18.008451,-26.443299c12.192573,-6.965665 23.948958,-9.040708 43.826799,-3.085566c19.877841,5.955142 36.411554,0.987381 43.619089,-10.220937c7.207534,-11.208318 4.839643,-19.068797 12.878017,-26.613005c8.038374,-7.544208 24.572087,-5.762294 32.818171,-1.157087c8.246084,4.605207 13.56346,14.101036 12.462597,23.334592c-1.100863,9.233556 -5.130435,17.186602 -23.678934,18.320547c-18.548499,1.133946 -33.794407,12.943949 -39.88031,24.684527c-6.085902,11.740578 -5.435455,18.333687 -10.772057,30.268022c-5.336601,11.934335 -15.550157,17.960721 -29.720976,19.871514c-14.170819,1.910793 -31.312295,1.385806 -46.267411,-11.353973z" />

            <defs>
                <linearGradient id="shape-1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#FFFF00" />
                    <stop offset="100%" stop-color="#F96202" />
                </linearGradient>
            </defs>
        </svg>-->

        <div class="container">
            <!--<img src="/img/starter/shapes/banner-shapes-1-3.png" class="banner-one__shape-moc-1" alt="">-->
            <!--<img src="/img/starter/shapes/banner-moc-1-1.png" class="banner-one__moc" alt="">-->

            <client-only v-if="!smallscreen">
                <lazy-zimed-breathe />
            </client-only>

            <div class="row">
                <div class="col-lg-7">
                    <div class="banner-one__content">
                        <p class="banner-one__tag-line">
                            {{ $t(`zimed.${tag}`) }}
                        </p>

                        <h1>{{ $t('zimed.biggest_goals') }}</h1>
                        <p>{{ $t('zimed.tools') | linebreak(_self) }}</p>

                        <span @click="goBack()" class="thm-btn banner-one__btn">
                            {{ $t('zimed.start') }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import { getCoords } from '~/utils/common/coords.mjs'
    import { goBack } from '~/mixins/common'

    export default {
        mixins: [goBack],

        filters: {
            linebreak(s, context) {
                return context.mobile ? s.replace(/\n/g, ' ') : s
            }
        },
        computed: {
            tag: {
                set(randomtag) {
                    this.$store.commit('app/set', { randomtag })
                },
                get() {
                    return this.$store.state.app.randomtag
                }
            },
            mobile() {
                return !!(this.$BROWSER || { IS_MOBILE: true }).IS_MOBILE
            },
            smallscreen() {
                // const { window: size } = this.$store.state.app

                return this.mobile

                /* return size
                    ? this.mobile && size.diagonal < 927
                    : this.mobile */
            },
            taglist() {
                return this.$store.state.app.taglist
            }
        },
        data: () => ({
            gradient: false,

            min: 0,
            max: 0
        }),
        watch: {
            '$store.state.app.window': 'positioning'
        },
        methods: {
            positioning()
            {
                const { top, height } = getCoords(this.$el)

                this.max = top + height
                this.min = top
            },
            emitVisibility(data)
            {
                this.$bus.$emit('scroll:goal', { id: 'banner', ...data })
            },
            onScroll(event)
            {
                const offsetTop = event.target.scrollingElement.scrollTop

                if (offsetTop > this.min && offsetTop < this.max) {
                    this.emitVisibility({ min: this.min, max: this.max })
                }
            }
        },
        created()
        {
            this.tag || (this.tag = this.taglist[Math.floor(Math.random() * this.taglist.length)])

            if (process.browser) {
                this.gradient = true
            }
        },
        mounted()
        {
            this.$nextTick().then(this.positioning)
        }
    }
</script>
