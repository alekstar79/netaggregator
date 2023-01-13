<template>
    <v-container @mouseenter="$emit('mouseenter')" @mouseleave="$emit('mouseleave')" class="settings-menu">
        <v-system-bar v-if="fullscreen && $store.state.app.vkapp" :color="barColor" height="10px" />

        <v-layout column>
            <v-flex v-if="fullscreen">
                <v-layout class="vk-transition" justify-start>
                    <v-btn @click="$emit('close')" class="vk-transition__cross--btn" aria-label="close" icon>
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-layout>
            </v-flex>

            <v-flex>
                <div class="text-center text-uppercase sidebar-filter">
                    {{ $t('common.settings') }}
                </div>
            </v-flex>

            <v-flex class="colors" xs12>
                <v-layout class="colors-list" justify-center>
                    <v-avatar v-for="(cl, i) in colors"
                        @click="setColor(cl)"
                        :class="{ 'color-bage': true, 'color-active': cl === color, [cl]: true }"
                        :key="`${cl}-${i}`"
                        size="23"
                    />
                </v-layout>
            </v-flex>

            <v-divider class="my-2" :style="{ visibility: 'hidden', opacity: 0 }" />

            <v-flex xs12>
                <v-layout class="covers-list" justify-center>
                    <template v-for="cv in covers">
                        <v-flex v-if="cv === 'simple'"
                            @click="setCover(cv)"
                            :class="{ 'cover-image': true, 'image-active': cv === cover }"
                            :style="{ backgroundColor: '#262E58' }"
                            class="pa-2"
                            height="120"
                            :key="cv"
                        />
                        <v-img v-else
                            @click="setCover(cv)"
                            :class="{ 'cover-image': true, 'image-active': cv === cover }"
                            :src="cv"
                            :key="cv"
                            class="pa-2"
                            height="120"
                        />
                    </template>
                </v-layout>
            </v-flex>

            <v-divider class="my-3" :style="{ visibility: 'hidden', opacity: 0 }" />

            <v-flex class="toggler">
                <v-layout justify-center>
                    <input type="checkbox" id="lang" v-model="locale">
                    <label for="lang">EN</label>
                </v-layout>
            </v-flex>

            <v-flex v-if="!$store.state.app.webview" class="toggler pt-3">
                <v-layout justify-center>
                    <input type="checkbox" id="theme" v-model="theme">
                    <label for="theme">NIGHT</label>
                </v-layout>
            </v-flex>

            <v-flex class="toggler pt-3">
                <v-layout justify-center>
                    <input type="checkbox" id="hints" v-model="hints">
                    <label for="hints" class="reverse-toggler">OFF</label>
                </v-layout>
            </v-flex>

            <!--<v-flex v-if="!mobile && isTilt" class="toggler pt-3">
                <v-layout justify-center>
                    <input type="checkbox" id="tilt" v-model="tilt">
                    <label for="tilt">OFF</label>
                </v-layout>
            </v-flex>

            <v-flex v-if="!mobile && isSnow" class="toggler pt-3">
                <v-layout justify-center>
                    <input type="checkbox" id="snow" v-model="snow">
                    <label for="snow">OFF</label>
                </v-layout>
            </v-flex>-->

            <v-divider class="mt-3 mb-1" :style="{ visibility: 'hidden', opacity: 0 }" />

            <lazy-core-share />
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        props: {
            fullscreen: {
                default: false,
                type: Boolean
            }
        },
        computed: {
            theme: {
                set(v) {
                    this.$store.commit('app/set', { theme: v ? 'dark' : 'light' })
                },
                get() {
                    return this.$store.state.app.theme === 'dark'
                }
            },
            locale: {
                set(v) {
                    this.$store.commit('app/set', { locale: v ? 'en' : 'ru' })
                },
                get() {
                    return this.$store.state.app.locale === 'en'
                }
            },
            hints: {
                set(hints) {
                    this.$ls.set('theme', { hints, theme: this.theme, color: this.color, cover: this.cover })

                    this.$store.commit('app/set', { hints })
                },
                get() {
                    return this.$store.state.app.hints
                }
            },
            /* tilt: {
                set(tilt) {
                    this.$store.commit('app/set', { tilt })
                },
                get() {
                    return this.$store.state.app.tilt
                }
            },
            snow: {
                set(snow) {
                    this.$store.commit('app/set', { snow })
                },
                get() {
                    return this.$store.state.app.snow
                }
            },
            isSnow() {
                return typeof this.$store.state.app.snow !== 'undefined'
            },
            isTilt() {
                return typeof this.$store.state.app.tilt !== 'undefined'
            }, */
            barColor() {
                return this.$vuetify.theme.dark ? 'transparent' : '#f5f5f5'
            },
            colors() {
                const light = ['secondary','accent','info'],
                    dark = ['accent','accent','accent']

                return this.$vuetify.theme.dark ? dark : light
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            cover() {
                return this.$store.state.app.cover
            }
        },
        watch: {
            locale: 'setLocale',
            theme: 'setTheme'
        },
        data: () => ({
            covers: [
                '/img/sidebar/c01.jpg',
                '/img/sidebar/pcb-thumb.svg',
                'simple'
            ]
        }),
        methods: {
            setColor(color)
            {
                const theme = this.theme ? 'dark' : 'light'

                this.$ls.set('theme', { color, cover: this.cover, theme, hints: this.hints })

                this.$store.commit('app/set', { color })
            },
            setCover(cover)
            {
                const theme = this.theme ? 'dark' : 'light'

                this.$ls.set('theme', { cover, color: this.color, theme, hints: this.hints })

                this.$store.commit('app/set', { cover })
            },
            setTheme()
            {
                const theme = this.theme ? 'dark' : 'light'

                this.$ls.set('theme', { theme, color: this.color, cover: this.cover, hints: this.hints })
                // this.$store.commit('app/set', { theme })
            },
            setLocale(v)
            {
                const locale = v ? 'en' : 'ru'

                this.$i18n.locale = locale
                this.$cookies.set('locale', locale, {
                    maxAge: 31536000,
                    secure: true,
                    path: '/'
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .settings-menu .layout {
        .sidebar-filter {
            height: 30px;
            line-height: 25px;
            font-size: 12px !important;
            font-weight: 600;
            color: #495057;
        }
        .vk-transition__cross--btn {
            cursor: pointer;
            color: #828a99;

            &:hover::before {
                background-color: currentColor;
            }
        }
        .colors-list .color-bage {
            margin: 0 5px;
            cursor: pointer;
        }
        .covers-list .cover-image {
            max-width: 55px;
            height: 120px;
            margin: 0 5px;
            cursor: pointer;

            border: 3px solid #fff;
            border-radius: 10px;

            transition: all .34s;

            &.image-active {
                border-color: #00bcd4;
            }
        }
        .colors.flex.xs12 {
            padding: 7px;
        }
        .toggler {
            font-size: 10px;

            label {
                z-index: 99;
            }
        }
        #lang, #theme, #hints, #tilt, #snow {
            display: none;
        }
        [for="theme"],
        [for="hints"],
        [for="lang"],
        [for="tilt"],
        [for="snow"] {
            position: relative;
            display: block;
            padding: 15px;
            width: 110px;

            border-radius: 16px;
            line-height: 3px;
            cursor: pointer;
            color: #31b3ff;

            text-shadow: 1px 1px 0 rgba(255,255,255,.15);
            background: rgb(71, 71, 71);
            box-shadow:
                0 1px 3px rgba(100,100,100,.2),
                inset 0 0 0 5px rgb(60,60,60),
                inset 0 6px 6px rgba(0,0,0,.5),
                inset 0 -6px 1px rgba(255,255,255,.2);

            user-select: none;

            &:before {
                position: absolute;
                right: 15px;

                color: #31b3ff;
            }
            &:after {
                position: absolute;
                left: 5px;
                top: 5px;

                display: flex;
                justify-content: center;
                height: 22px;
                width: 50px;

                border-radius: 10px;
                background: #ccc linear-gradient(#fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
                color: rgb(71, 71, 71);

                line-height: 23px;
                font-weight: 700;
                font-size: 9px;

                transition: .5s;
            }
            &.reverse-toggler:after {
                left: 55px;
            }
        }
        #theme:checked ~ [for="theme"],
        #hints:checked ~ [for="hints"],
        #lang:checked ~ [for="lang"],
        #tilt:checked ~ [for="tilt"],
        #snow:checked ~ [for="snow"] {
            &:after {
                left: 55px;
            }

            &.reverse-toggler:after {
                left: 5px;
            }
        }
        [for="theme"]:before {
            content: 'DAY';
        }
        [for="lang"]:before {
            content: 'RU';
        }
        [for="hints"]:before,
        [for="tilt"]:before,
        [for="snow"]:before {
            content: 'ON';
        }
        [for="theme"]:after {
            content: 'THEME';
        }
        [for="hints"]:after {
            content: 'HINTS';
        }
        [for="lang"]:after {
            content: 'LANG';
        }
        [for="tilt"]:after {
            content: 'TILT';
        }
        [for="snow"]:after {
            content: 'SNOW';
        }
        button {
            margin: 0;
        }
    }
</style>
