<template>
    <v-toolbar
        @click="enter"
        v-click-outside="leave"
        :class="{ [color]: true, wide, down, mobile }"
        class="image-editor__topbar"
        v-bind="$attrs"
        height="60px"
    >
        <v-list-item v-if="wide" @click="goaway" :ripple="false">
            <v-list-item-avatar>
                <lazy-core-logo fill="#fff" />
            </v-list-item-avatar>
        </v-list-item>

        <v-toolbar-title v-else @click="list = !list" class="tertiary--text">
            <div id="hamburger" :class="{ open: !list }">
                <span /><span /><span />
            </div>
        </v-toolbar-title>

        <v-spacer v-if="wide" />

        <v-toolbar-items :class="{ open: wide || !list, close: list }">
            <v-layout align-center>
                <v-btn v-if="!wide" @click="goaway" :ripple="false" text>
                    {{ $t('graph.back') }}
                </v-btn>

                <template v-for="block in menu">
                    <v-menu
                        v-model="block.state"
                        transition="slide-y-transition"
                        :content-class="`top-menu ${block.id}`"
                        :close-on-content-click="mobile"
                        :open-on-hover="wide"
                        :min-width="170"
                        :key="block.key"
                        bottom
                    >
                        <template #activator="{ on }">
                            <v-btn v-on="block.on(on)" :ripple="false" text>
                                {{ $t(block.activator) }}
                            </v-btn>
                        </template>

                        <v-card v-if="block.items" class="top-menu__box">
                            <v-container @mouseenter="enter" @mouseleave="leave" :data-top="true">
                                <template v-for="(item, j) in block.items">
                                    <v-flex :key="j">
                                        <v-btn
                                            v-bind="item.attrs"
                                            class="top-menu__btn"
                                            @click="apply(item)"
                                            @mouseenter="btnEnter(item)"
                                            @mouseleave="btnLeave(item)"
                                            :icon="!!(item.aicon || item.bicon)"
                                            :text="!item.aicon && !item.bicon"
                                            :disabled="item.hidden"
                                            :key="item.hidden"
                                            :class="{
                                                'a-icon': item.aicon,
                                                'b-icon': item.bicon
                                            }"
                                        >
                                            <v-icon v-if="item.bicon">
                                                {{ item.bicon }}
                                            </v-icon>
                                            {{ $t(item.name) }}
                                            <v-icon v-if="item.aicon">
                                                {{ item.aicon }}
                                            </v-icon>
                                        </v-btn>
                                    </v-flex>
                                </template>
                            </v-container>
                        </v-card>
                    </v-menu>
                </template>
            </v-layout>
        </v-toolbar-items>

        <v-dialog v-model="dialog" :width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-graph-rename-dialogue :name="name" @close="dialog = false" @apply="applyName" />
        </v-dialog>
    </v-toolbar>
</template>

<script>
    import { cancelIdleCallback, fulfill } from '~/utils/callbacks.mjs'
    import { goBack } from '~/mixins/common'

    export default {
        mixins: [goBack],

        props: {
            menu: {
                required: true,
                type: Array
            },
            visible: {
                default: false,
                type: Boolean
            }
        },
        data() {
            return {
                down: Boolean(!this.mobile && this.$store.state.canvas.fixed),
                wide: Boolean(!this.mobile && this.$store.state.app.vkapp),

                activeIndex: null,
                name: null,
                list: true,

                started: false,
                dialog: false,

                taskHandle: 0,
                attempts: 10
            }
        },
        computed: {
            fixed() {
                return Boolean(this.$store.state.canvas.fixed)
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            '$store.state.app.window': 'measure',

            visible(v) {
                this.down || (this.down = Boolean(this.fixed || v))
            }
        },
        methods: {
            measure()
            {
                let w, { window: win } = this.$store.state.app

                if (this.taskHandle) cancelIdleCallback(this.taskHandle)

                this.wide = Boolean(!this.mobile && this.$store.state.app.vkapp)

                this.attempts || (this.attempts = 10)

                this.taskHandle = fulfill(() => {
                    this.attempts--

                    if ((w = this.$el.clientWidth)) {
                        this.$emit('change', { position: 'top', size: `${w}px` })

                        this.wide || (this.wide = win.width > 660)

                        this.started = this.wide || !this.attempts
                        this.list = true

                        return this.started
                    }
                })
            },
            enter()
            {
                this.menu.forEach(b => { b.reload() })

                this.down = true
            },
            leave(e)
            {
                let down = Boolean(!this.mobile && this.fixed)

                if (this.mobile && e.target.classList.contains('hover-zone')) {
                    down = e.target.classList.contains('top')
                }

                this.down = down
            },
            findIdx(obj)
            {
                return this.$parent.canvas._objects.findIndex(o => o.custom.unique === obj.custom.unique)
            },
            rename()
            {
                const obj = this.$parent.canvas.getActiveObject()

                if (!obj || ['group', 'activeSelection'].includes(obj.type)) {
                    return this.$bus.$emit('snack', { content: 'graph.choose_layer', color: 'warning' })
                }

                this.activeIndex = this.findIdx(obj)
                this.name = obj.custom.name
                this.dialog = true
            },
            btnEnter(item)
            {
                typeof item.enter === 'function' && item.enter()
            },
            btnLeave(item)
            {
                typeof item.leave === 'function' && item.leave()
            },
            applyName({ name })
            {
                this.dialog = false
                this.$parent.canvas._objects[this.activeIndex].customName(name)
                this.activeIndex = null
                this.name = null
            },
            apply(item)
            {
                this.list = true

                const reload = () => { item.hidden = !item.hidden },
                    request = item.apply()

                if (!request) return

                if (request.call === 'graph-rename-dialogue') {
                    this.rename()
                }
                if (item.thenable) {
                    request.then(reload).then(reload)
                }
            },
            forceHide()
            {
                this.menu.forEach(item => item.state = false)
            },
            viewBlock(idx)
            {
                this.menu.forEach((_, i) => { this.menu[i].state = i === idx })

                return new Promise(resolve => setTimeout(resolve))
            },
            hideBlock(idx)
            {
                this.menu[idx].state = false
            },
            async goaway()
            {
                await this.$ls.set('route', { path: null })

                await this.goBack()
            }
        },
        mounted()
        {
            this.$nextTick().then(this.measure).then(this.forceHide)

            this.$parent.$on('force:hide', this.forceHide)
        }
    }
</script>

<style lang="scss" scoped>
    .v-menu__content.top-menu {
        border-radius: 5px;

        .top-menu__box {
            ::v-deep .container {
                padding: 0;

                .top-menu__btn {
                    padding: 0 15px;
                    margin: 0;

                    height: 42px;
                    width: 100%;

                    justify-content: start;
                    border-radius: 0;

                    font-weight: 400 !important;
                    line-height: 1.5em;

                    &:hover {
                        background-color: rgba(50,50,50,.1);
                    }
                    .v-btn__content .v-icon.mdi-external {
                        align-items: flex-start;
                        font-size: 14px;
                    }
                }
            }
        }
    }
    .v-toolbar.image-editor__topbar {
        height: fit-content !important;
        max-width: 960px;
        min-height: 60px;
        margin: 0 50%;
        width: 70%;

        border-radius: 0 !important;
        transform: translateX(-50%);
        transition: .2s cubic-bezier(.4,0,.2,1);
        top: -55px;

        z-index: 100;

        &.mobile {
            top: -50px
        }
        &.down {
            top: 0;
        }
        &:hover {
            top: 0;
        }
        &.wide {
            border-radius: 5px !important;

            &.down {
                top: 5px;
            }
            &:hover {
                top: 5px
            }
        }
        ::v-deep .v-toolbar__content {
            justify-content: space-between;
            min-height: unset;
            margin: 0;

            .v-list-item {
                flex: 0 0 auto;
            }
            .v-avatar {
                height: unset !important;
                margin: 5px !important;
            }
            .v-toolbar__title {
                height: 45px;

                align-self: flex-start;
                cursor: pointer;

                #hamburger {
                    display: flex;
                    flex-direction: column;
                    padding: .6em;

                    cursor: pointer;

                    span {
                        width: 20px;
                        height: 2px;
                        margin-top: 5px;

                        background-color: #FFFFFF;
                        transition: all .33s;
                    }
                    &.open {
                        span:nth-child(1) {
                            transform: rotate(45deg) translate(5px, 5px);
                        }
                        span:nth-child(2) {
                            transform: rotate(-45deg);
                        }
                        span:nth-child(3) {
                            transform: rotate(45deg) translate(-5px, -5px);
                        }
                    }
                }
            }
            .v-toolbar__items .v-menu {
                width: 100%;

                &:hover {
                    background-color: rgba(256,256,256,.3);
                }
            }
            .v-btn {
                padding: 10px 5px;

                font-weight: 500 !important;
                letter-spacing: .3px;

                .v-btn__content {
                    color: #fff;
                }
            }
        }
    }
    @media screen and (max-width: 1100px) {
        .image-editor__topbar {
            width: 80% !important;
            // margin: 0 10% !important;
        }
    }
    @media screen and (max-width: 970px) {
        .image-editor__topbar {
            width: 90% !important;
            // margin: 0 5% !important;
        }
    }
    @media screen and (max-width: 835px) {
        .image-editor__topbar {
            width: 100% !important;
            // margin: 0 !important;
            border-radius: 0;
        }
    }
    @media screen and (max-width: 660px) {
        .image-editor__topbar {
            ::v-deep .v-toolbar__content {
                flex-direction: column;
                height: 100% !important;
                // margin-left: 0 !important;

                .v-avatar {
                    margin-right: 0;
                }
                .v-list-item {
                    flex: unset;
                    padding: 0;
                }
                .v-toolbar__items {
                    transition: all .3s;
                    width: 100%;

                    &.open {
                        height: 100vh;
                        transform-origin: top;
                        transform: scale(1);

                        .v-menu {
                            opacity: 1;
                            transition: all .3s;
                        }
                    }
                    &.close {
                        height: 0;
                        transform-origin: top;
                        transform: scale(0);

                        .v-menu {
                            opacity: 0;
                            transition: all .3s;
                        }
                    }
                    .layout {
                        flex-direction: column;
                    }
                }
            }
            ::v-deep .v-btn .v-btn__content {
                justify-content: center; // start
            }
        }
        ::v-deep .v-menu .v-menu__content {
            width: 100%;
        }
    }
</style>
