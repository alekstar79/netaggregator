<template>
    <v-navigation-drawer
        v-model="drawer"
        v-schema:scope="{ type: 'SiteNavigationElement' }"
        :mobile-breakpoint="breakpoint"
        :key="force"
        color="#0e1538"
        class="side-nav"
        dark
        app
    >
        <v-list :dense="smallscreen" nav>
            <v-list-item :dense="smallscreen">
                <v-list-item-avatar>
                    <lazy-core-logo fill="#cfcfcf" />
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title class="app-tile">
                        Netaggregator
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider />

            <template v-for="item in links">
                <v-list-item
                    v-schema="{ prop: 'url' }"
                    :active-class="color"
                    :dense="smallscreen"
                    :key="item.to"
                    :to="item.to"
                    nuxt
                >
                    <v-list-item-icon>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title
                            v-schema="{ prop: 'name' }"
                            v-html="$t(`toolbar.${item.to.slice(1)}`)"
                        />
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-list>

        <template #img>
            <client-only>
                <helper-pcb-routes v-if="cover === '/img/sidebar/pcb-thumb.svg'" />
                <v-img v-else-if="cover !== 'simple'" :src="cover" />
            </client-only>
        </template>

        <template #append>
            <client-only>
                <v-list :dense="smallscreen" nav>
                    <template v-if="!mobile">
                        <v-list-item
                            v-if="!owner && isOwner"
                            v-schema="{ prop: 'url' }"
                            :active-class="color"
                            :dense="smallscreen"
                            @click="setOwner"
                            nuxt
                        >
                            <v-list-item-icon>
                                <v-icon>mdi-emoticon-happy-outline</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title v-schema="{ prop: 'name' }">
                                    Owner
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item
                            v-if="owner"
                            :active-class="color"
                            :dense="smallscreen"
                            @click="$emit('fake')"
                        >
                            <v-list-item-icon>
                                <v-icon>mdi-emoticon-happy-outline</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>
                                    Fake
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>

                    <v-list-item
                        v-if="!smallscreen"
                        :active-class="color"
                        @click="$emit('intro')"
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-play-circle-outline</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ $t('toolbar.tour') }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                        v-schema="{ prop: 'url' }"
                        :active-class="color"
                        :dense="smallscreen"
                        skip-intro
                        to="/news"
                        nuxt
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-star-outline</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title v-schema="{ prop: 'name' }">
                                {{ $t('toolbar.news') }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                        :active-class="color"
                        :dense="smallscreen"
                        @click="$emit('help')"
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-help-circle-outline</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ $t('toolbar.help') }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                        :active-class="color"
                        :dense="smallscreen"
                        @click="$emit('law')"
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-file-document-outline</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ $t('toolbar.law_docs') }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                        :active-class="color"
                        :dense="smallscreen"
                        @click="$emit('ref')"
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-chart-bubble</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ $t('toolbar.referrals') }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item
                        :active-class="color"
                        :dense="smallscreen"
                        @click="toTariff"
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-external</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ $t('toolbar.subscribe') }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </client-only>
        </template>
    </v-navigation-drawer>
</template>

<script>
    // import { fulfill } from '~/utils/callbacks.mjs'

    export default {
        data: () => ({
            drawerState: undefined,
            force: false,

            links: [
                { to: '/chatbot',  icon: 'mdi-message-text'    },
                { to: '/stream',   icon: 'mdi-view-stream'     },
                { to: '/widget',   icon: 'mdi-widgets'         },
                { to: '/cover',    icon: 'mdi-view-carousel'   },
                { to: '/designer', icon: 'mdi-palette-outline' }
            ]
        }),
        computed: {
            drawer: {
                set(drawer) {
                    this.$store.commit('app/set', { drawer })
                },
                get() {
                    return this.$store.state.app.drawer
                }
            },
            breakpoint() {
                return this.$store.state.app.vkapp ? 1280 : 927
            },
            smallscreen() {
                const { window: size } = this.$store.state.app

                return size
                    ? this.mobile && size.diagonal < 927
                    : this.mobile
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            safari() {
                return !!(this.$BROWSER || {}).IS_SAFARI
            },
            ios() {
                return !!(this.$BROWSER || {}).IS_IOS
            },
            cover() {
                return this.$store.state.app.cover
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            },
            owner() {
                return this.$store.state.app.owner
            },
            isOwner() {
                return this.user?.id === 25520481
            }
        },
        watch: {
            drawer: 'correct'
        },
        methods: {
            /* setObserver()
            {
                const observer = new MutationObserver((/* mutationRecords *!/) => {
                    if (!this.ios && !this.safari) return

                    ;(async () => {
                        await new Promise(resolve => setTimeout(resolve, 900))

                        this.setStyle()

                        const style = window.getComputedStyle(this.$el, null)

                        console.log({
                            transform: style.transform,
                            visibility: style.visibility,
                            opacity: style.opacity
                        })

                    })()
                })

                observer.observe(this.$el, {
                    attributes: true
                })
            }, */
            correct(/* nv, ov */)
            {
                if (this.ios && this.safari) {
                    this.force = !this.force
                }

                /* await new Promise(resolve => setTimeout(resolve, 100))

                fulfill(() => {
                    this.setStyle()
                }) */
            },
            /* setStyle()
            {
                this.$el.style.transform = `translateX(${this.drawer ? '0' : '-256px'})`
                this.$el.style.visibility = 'visible'
                this.$el.style.opacity = '1'
            }, */
            setOwner()
            {
                this.$store.commit('app/set', { owner: true })

                this.$ls.set('owner', true)
            },
            toTariff()
            {
                this.$store.commit('app/set', { goto: 4000 })
                this.$router.push('/')
            },
            pullout()
            {
                if (typeof this.drawerState === 'undefined') {
                    this.drawerState = this.drawer
                }

                this.drawer = true
            },
            restore()
            {
                this.drawer = this.drawerState
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('sidebar:pullout', this.pullout)
            this.$bus.$off('sidebar:restore', this.restore)
        },
        mounted()
        {
            const { $screen, $store, mobile, breakpoint } = this

            this.$bus.$on('sidebar:pullout', this.pullout)
            this.$bus.$on('sidebar:restore', this.restore)

            switch (true) {
                case !!$store.state.app.vkapp:
                case !!mobile:
                    this.drawer = false
                    break

                default:
                    this.drawer = $screen.width > breakpoint
            }

            this.drawerState = this.drawer

            // this.setObserver()
        }
    }
</script>

<style lang="scss" scoped>
    .side-nav.v-navigation-drawer {
        will-change: transform, visibility, width;
        max-height: 100% !important;
        box-shadow: unset;

        &.v-navigation-drawer--close,
        &.v-navigation-drawer--open {
            visibility: visible !important;
        }

        ::v-deep .v-navigation-drawer__content {
            -ms-overflow-style: none;
            scrollbar-width: none;

            &::-webkit-scrollbar {
                width: 0;
            }
            .v-list {
                padding: 8px;

                .v-divider {
                    margin: 0;
                    width: unset;
                }
                .v-list-item {
                    margin: 8px 0 0 0;
                    max-height: 52px;

                    &:first-child {
                        margin: 0 0 8px 0;
                    }
                    &.v-list-item--dense {
                        max-height: 40px;
                        min-height: 40px;
                    }
                }
            }
            .app-tile {
                font-size: 1.3rem;
            }
        }
        ::v-deep .v-navigation-drawer__image {
            .v-image.v-responsive {
                height: 100%;
            }
            .v-responsive__content {
                background: rgba(27,27,27,.7);
            }
        }
        ::v-deep .v-navigation-drawer__append {
            .v-list {
                padding: 8px;

                .v-list-item {
                    margin: 0 0 8px 0;
                    max-height: 52px;
                }
            }
        }
    }
</style>
