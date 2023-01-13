<template>
    <nav class="header-navigation stricky" :class="{ stricked, original, 'stricky-fixed': fixed, simple: smallscreen }">
        <client-only>
            <template v-if="!smallscreen && stricked">
                <v-layout style="position:absolute; width:100%; height:100%; background-color:#000" />
                <canvas width="100%" height="100%" ref="canvas" />
            </template>

            <div class="container">
                <div class="main-nav__logo-box">
                    <v-list-item class="main-nav__logo" :ripple="false">
                        <v-list-item-avatar>
                            <lazy-core-logo fill="#fff" />
                        </v-list-item-avatar>

                        <v-list-item-title class="app-title">
                            NA
                        </v-list-item-title>

                        <v-list-item-content>
                            <v-btn class="side-menu__toggler"
                                @click.stop="$bus.$emit('sidemenu:toggle')"
                                elevation="0"
                                color="#fff"
                                icon
                                fab
                            >
                                <v-icon>mdi-menu</v-icon>
                            </v-btn>
                        </v-list-item-content>
                    </v-list-item>
                </div>

                <div class="main-nav__main-navigation">
                    <lazy-zimed-scroll-menu />
                </div>

                <div class="main-nav__right">
                    <v-btn class="lang-toggler__btn"
                        @click="locale = locale === 'ru' ? 'en' : 'ru'"
                        elevation="0"
                        color="#fff"
                        text
                        icon
                        fab
                    >
                        {{ locale === 'ru' ? 'EN' : 'RU' }}
                    </v-btn>
                </div>
            </div>
        </client-only>
    </nav>
</template>

<script>
    export default {
        /* components: {
            ZimedScrollMenu: () => import('./ScrollMenu')
        }, */
        props: {
            className: {
                type: String,
                required: true
            }
        },
        computed: {
            locale: {
                set(locale) {
                    this.$store.commit('app/set', { locale })
                },
                get() {
                    return this.$store.state.app.locale
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
            stricked() {
                return this.className === 'stricked'
            },
            original() {
                return this.className === 'original'
            }
        },
        data: () => ({
            fixed: false,
            src: null,
            dst: null
        }),
        watch: {
            locale: 'setLocale',

            '$store.state.app.window'() {
                if (this.stricked && !this.smallscreen) {
                    this.setImageToCanvas()
                }
            }
        },
        methods: {
            setImageToCanvas(ctx)
            {
                try {

                    ctx && (this.src = ctx)

                    this.dst || (this.dst = this.$refs.canvas.getContext('2d'))

                    const { width: w } = this.$el.getBoundingClientRect(),
                        h = 91

                    this.$refs.canvas.height = h
                    this.$refs.canvas.width = w

                    this.src && this.dst.clearRect(0, 0, w, h)
                    this.src && this.dst.drawImage(this.src.canvas, 0, 28, w, h, 0, 0, w, h)

                } catch (e) {
                }
            },
            trackClass({ fixed })
            {
                this.fixed = this.stricked && fixed
            },
            setLocale(v)
            {
                this.$i18n.locale = v
                this.$cookies.set('locale', v, {
                    maxAge: 31536000,
                    secure: true,
                    path: '/'
                })
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('stricky', this.trackClass)

            if (this.stricked && !this.smallscreen) {
                this.$bus.$off('zimed:grid', this.setImageToCanvas)
            }
        },
        beforeMount()
        {
            this.$bus.$on('stricky', this.trackClass)

            if (this.stricked && !this.smallscreen) {
                this.$bus.$on('zimed:grid', this.setImageToCanvas)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .header-navigation {
        canvas {
            position: absolute;
            height: 100%;
            width: 100%;
        }
        .container {
            .main-nav__logo-box {
                .v-list-item--link::before {
                    background-color: transparent;
                }
                .main-nav__logo.v-list-item {
                    .v-list-item__content {
                        padding: 10px;
                        flex: unset;

                        .side-menu__toggler {
                            height: 44px;
                            width: 44px;

                            .v-icon {
                                font-size: 32px;
                            }
                        }
                    }
                    .v-list-item__title {
                        margin-left: 10px;
                        font-size: 32px;
                        cursor: default;
                        color: #fff;
                    }
                    .v-avatar {
                        margin-right: 0;
                    }
                }
            }
            .main-nav__right {
                .lang-toggler__btn {
                    height: 44px;
                    width: 44px;
                }
            }
        }
    }
</style>
