<template>
    <v-app-bar
        v-model="state"
        v-show="height !== '0px'"
        class="app-toolbar v-toolbar--fixed"
        :class="{ flatten: presentation }"
        :elevation="scroll > 0 ? 1 : 0"
        :hide-on-scroll="!mobile"
        elevate-on-scroll
        :height="height"
        dense
        tile
        app
    >
        <v-toolbar-items
            class="app-tools"
            :class="{
                'justify-space-between': !mobile || !$store.state.app.vkapp,
                'justify-start': mobile && $store.state.app.vkapp
            }"
        >
            <div class="d-flex sidebar-toggler">
                <v-app-bar-nav-icon @click="$store.commit('app/toggleDrawer')" aria-label="menu" />

                <client-only>
                    <v-toolbar-title
                        v-if="!smallscreen"
                        v-html="$t(`toolbar.${($route.name || '404').toLowerCase()}`)"
                        class="app-title"
                    />
                </client-only>
            </div>

            <div class="d-flex dots-nav" data-position="bottom-middle-aligned">
                <div class="indicator">
                    <span v-for="btn in buttons"
                        @click="internal(btn)"
                        :class="{ active: btn.icon === active }"
                        :key="btn.icon"
                        class="btn-dot"
                    />
                </div>
            </div>

            <div class="d-flex tools" data-position="bottom-left-aligned">
                <v-btn @click="$emit('calc:on')" aria-label="calculator" icon>
                    <v-icon dense>mdi-calculator</v-icon>
                </v-btn>
                <v-btn v-on="{ click: show.bind(_self, 'filter'), [enter]: show.bind(_self, 'filter'), [leave]: close }"
                    aria-label="settings"
                    icon
                >
                    <v-icon dense>mdi-cog</v-icon>
                </v-btn>
                <v-badge :value="fail" :class="{ pulse: fail }" offset-x="14" offset-y="20" color="error" dot>
                    <v-btn v-on="{ click: show.bind(_self, 'user'), [enter]: show.bind(_self, 'user'), [leave]: close }"
                        aria-label="account"
                        icon
                    >
                        <v-icon dense>mdi-account</v-icon>
                    </v-btn>
                </v-badge>
            </div>
        </v-toolbar-items>

        <template v-if="mobile">
            <v-dialog v-model="menu" fullscreen>
                <v-card>
                    <lazy-component :is="`lazy-core-${entity}`" @close="menu = false" fullscreen />
                </v-card>
            </v-dialog>
        </template>
        <template v-else>
            <v-menu v-model="menu"
                transition="slide-y-transition"
                :close-on-content-click="false"
                :min-width="250"
                :max-width="250"
                :position-x="x"
                :position-y="y"
                offset-x
                bottom
                left
            >
                <v-card>
                    <lazy-component
                        :is="`lazy-core-${entity}`"
                        @mouseenter="hold = true"
                        @mouseleave="hold = false"
                    />
                </v-card>
            </v-menu>
        </template>
    </v-app-bar>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'

    export default {
        props: {
            scroll: {
                type: Number,
                default: 0
            }
        },
        computed: {
            fail() {
                const { vkapp, error: e } = this.$store.state.app

                return !!(vkapp && e && (
                    e.error_code === 5 || 'server_side_auth' in e
                ))
            },
            buttons() {
                const name = (this.$route.name || '404').toLowerCase(),
                    b = this.$route.name ? this.$store.state.context.buttons[name] || [] : [],
                    a = [].concat(b)

                return name !== 'widget'
                    ? a.splice(-1).concat(a)
                    : a
            },
            active() {
                const name = (this.$route.name || '404').toLowerCase(),
                    { active } = this.$store.state.context

                return active[name] ?? (this.buttons[0] || {}).icon
            },
            smallscreen() {
                const { window: size } = this.$store.state.app

                return size
                    ? this.mobile && size.diagonal < 735 // 927
                    : this.mobile
            },
            presentation() {
                return this.$store.state.app.presentation
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            enter() {
                return this.mobile ? 'noop' : 'mouseenter'
            },
            leave() {
                return this.mobile ? 'noop' : 'mouseleave'
            }
        },
        watch: {
            $route: 'setRoute',

            hold(v) {
                v || (!this.mobile && (this.menu = false))
            },
            state(v) {
                this.$emit('state', v)
            }
        },
        data: () => ({
            state: false,

            menu: false,
            hold: false,

            height: '0px',
            entity: '',
            x: 0,
            y: 0
        }),
        methods: {
            show: debounce(function(entity, { target /* clientX, clientY, */ })
            {
                const { left, bottom, height, width } = target.getBoundingClientRect(),
                    resolver = this.resolver(entity)

                this.x = left + .7 * width    // clientX
                this.y = bottom - .3 * height // clientY

                this.entity = entity

                resolver().then(() => {
                    this.menu = true
                })

            }, 0),
            close: debounce(function()
            {
                this.menu = this.hold

            }, 0),
            resolver(entity)
            {
                return entity === this.entity ? () => Promise.resolve() : () => new Promise(this.flash)
            },
            flash(resolve)
            {
                this.menu = this.mobile

                setTimeout(resolve)
            },
            internal({ icon })
            {
                const route = (this.$route.name || '404').toLowerCase(),
                    { active } = this.$store.state.context

                this.$bus.$emit('context:on-change', { icon })

                this.$store.commit('context/set', {
                    active: { ...active, [route]: icon }
                })
            },
            async setRoute()
            {
                const { matched, path } = this.$route

                if (this.$ls && matched.length) {
                    await this.$ls.set('route', { path })
                }
            },
            setHeight: debounce(function()
            {
                this.height = '60px'
                this.state = true

            }, 100)
        },
        beforeDestroy()
        {
            this.$bus.$off('loading:finish', this.setHeight)
        },
        created()
        {
            this.$bus.$on('loading:finish', this.setHeight)

            this.setRoute()
        }
    }
</script>

<style lang="scss" scoped>
    .app-toolbar {
        min-height: unset;
        margin: 0;

        font-weight: 400;

        ::v-deep .v-toolbar__content {
            min-height: unset;

            .app-title {
                font-size: 18px;
                letter-spacing: unset;
                color: #8f8f8f;

                user-select: none;
            }
            .app-tools {
                display: flex;
                width: 100%;

                & > .d-flex {
                    align-items: center;

                    &.tools .v-badge {
                        .v-badge__badge.error.pulse {
                            will-change: transform;
                            animation: 1s linear infinite alternate scaleTransform;
                        }
                    }
                    .indicator {
                        cursor: pointer;

                        .btn-dot {
                            display: inline-block;
                            height: 15px;
                            width: 15px;
                            margin: 4px;
                            border-radius: 15px;
                            background: #8f8f8f;
                            transition: .4s;

                            &.active {
                                width: 35px;
                            }
                        }
                    }
                }
            }
            .v-btn {
                cursor: pointer;

                &:hover::before {
                    background-color: currentColor;
                }
                .v-icon {
                    font-size: 20px;
                    color: #8f8f8f;
                }
            }
        }
        &.flatten {
            box-shadow: none !important;
        }
    }
    @keyframes scaleTransform {
        to { transform: scale(1.5) }
    }
    @media all and (max-width: 490px) {
        .app-toolbar ::v-deep .v-toolbar__content {
            .app-tools > .d-flex {
                .indicator {
                    display: none;
                }
            }
        }
    }
</style>
