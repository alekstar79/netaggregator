<template>
    <v-flex class="scroller__panel"
        :class="{ [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true, empty: !list.length, chooser: check, 'mt-2': check }"
        ml-2 mr-1 mb-2
    >
        <div v-if="select" class="text-center disabled--text">
            <p>{{ $t('common.source') }}</p>
        </div>
        <div v-else class="d-flex scroller-list">
            <v-layout class="scroller-list__images" wrap>
                <client-only>
                    <div v-for="(item, index) in adapt" class="scroller-list__images--item" :key="item.key">
                        <v-card tile flat>
                            <v-img :src="doc ? lazysrc : item[media.src] || lazysrc"
                                :class="{ doc, forbidden: !item[media.src] }"
                                aspect-ratio="1"
                            >
                                <v-icon v-if="doc">
                                    {{ item.icon }}
                                </v-icon>
                            </v-img>

                            <v-card-title class="scroller-list__title" @click="choose(index)">
                                <p :style="{ fontSize }">{{ item.title }}</p>
                                <p :style="{ fontSize }" v-if="doc">
                                    {{ item.size | format(1) }}
                                </p>
                                <p :style="{ fontSize }" v-else>
                                    {{ item.size || item.count }}
                                </p>
                            </v-card-title>

                            <div v-if="check" class="check-marker" @click.stop="mark(item)">
                                <core-check-marker :checked="item.checked" />
                            </div>
                        </v-card>
                    </div>
                </client-only>
            </v-layout>
        </div>
    </v-flex>
</template>

<script>
    import { format } from '~/utils/common/format.mjs'
    import { each } from '~/utils/async-array.mjs'

    import { community } from '~/mixins/common'
    // import lazy from '~/directives/lazy'

    export default {
        mixins: [community],

        props: {
            check: {
                default: false,
                type: Boolean
            },
            media: {
                required: true,
                type: Object
            },
            list: {
                required: true,
                type: Array
            }
        },
        /* directives: {
            lazy
        }, */
        filters: {
            format
        },
        computed: {
            select() {
                return this.groups.length && !this.list.length
            },
            fontSize() {
                let w = this.$store.state.app.window.width,
                    f = 9

                switch (true) {
                    case w > 1000: f = 11; break
                    case w > 800:  f = 10; break
                }

                return f + 'px !important'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            doc() {
                return this.media.id === 'doc'
            },
            adapt() { // 450 240 120
                return this.media.id === 'video'
                    ? this.list.map(item => {
                        if (!Array.isArray(item.image)) return item

                        for (const img of item.image.reverse()) {
                            if ([450,320,240].includes(img.height)) {
                                item[this.media.src] = img.url
                                break
                            }
                        }

                        return item
                    })
                    : this.list
            }
        },
        watch: {
            list: 'preCache'
        },
        data: () => ({
            lazysrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            collection: new Set()
        }),
        methods: {
            initScroll()
            {
                this.preCache()

                if (this.smooth) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$el, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' },
                                callbacks: { onScroll: this.handleScroll }
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$el, {
                                damping: this.mobile ? .5 : 1,
                                continuousScrolling: false,
                                clipAlways: this.mobile
                            })

                            this.smooth.addListener(this.handleScroll)
                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            },
            preCache()
            {
                if (this.media.id !== 'photo') return

                each(this.list, item => {
                    const src = item[this.media.src]

                    if (!this.collection.has(src)) {
                        const img = new Image()

                        img.src = src
                    }
                })
            },
            handleScroll({ offset, limit } = {})
            {
                if (!offset || !limit) {
                    ({ position: offset, max: limit } = this.smooth.scroll())
                }
                if (offset.y >= limit.y - 300) {
                    this.$emit('load')
                }
            },
            choose(i)
            {
                let idx, prev, next, last = this.list.length, click = this.list[i]

                if (!this.check || this.media.id !== 'photo') {
                    return this.$emit('click', { click })
                }
                if (last < 9) {
                    return this.$bus.$emit('view', { frame: this.list, idx: i })
                }
                if (i === 0) {
                    return this.$bus.$emit('view', { frame: this.list.slice(0, 9), idx: 0 })
                }
                if (i === last - 1) {
                    return this.$bus.$emit('view', { frame: this.list.slice(-9), idx: 8 })
                }
                if (i <= 3) {
                    prev = 0
                    next = prev + 9
                    idx = i

                } else if (i >= last - 4) {
                    next = last
                    prev = last - 9
                    idx = i - prev

                } else {
                    prev = i - 4
                    next = prev + 9
                    idx = 4
                }

                this.$bus.$emit('view', {
                    frame: this.list.slice(prev, next),
                    idx
                })
            },
            mark(item)
            {
                item.checked = !item.checked

                this.$emit('click', {
                    check: item
                })
            }
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)
        }
    }
</script>

<style lang="scss" scoped>
    .scroller__panel {
        position: relative;
        display: flex;
        flex-direction: column;
        max-height: 82%;

        &.theme--dark {
            .disabled--text {
                color: #7a7a7a;
            }
        }
        &.empty {
            justify-content: center;
        }
        &.os-host-overflow,
        &.chooser {
            max-height: 100%;
        }
        .scroller-list {
            .scroller-list__images {
                transition: transform .3s ease;
                height: 100%;

                .scroller-list__images--item {
                    position: relative;
                    width: 33%;
                    padding: 5px;

                    cursor: pointer;

                    .v-image.v-responsive {
                        background-color: rgb(250, 251, 252);
                        background-position: center;
                        background-size: cover;
                    }
                    .forbidden {
                        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjgwJSIgaGVpZ2h0PSI4MCUiPgoJPHBhdGggZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiNhZmJhYzYiIHN0cm9rZS13aWR0aD0iMyIgZD0iTTQ0Ljc2IDQ0LjdDMzcuNzUgNTEuNzQgMjYuMzQgNTEuNzcgMTkuMyA0NC43NkMxMi4yNiAzNy43NSAxMi4yMyAyNi4zNCAxOS4yNCAxOS4zQzI2LjI1IDEyLjI2IDM3LjY2IDEyLjIzIDQ0LjcgMTkuMjRDNTEuNzQgMjYuMjUgNTEuNzcgMzcuNjYgNDQuNzYgNDQuN1ogTTQ0Ljc2IDQ0LjcyTDE5LjI1IDE5LjI5Ii8+Cjwvc3ZnPgo=');
                        background-color: rgb(250,251,252);
                        background-position: center center;

                        & + div {
                            color: #afbac6 !important;
                        }
                    }
                    .doc {
                        & + div {
                            color: #afbac6 !important;
                        }
                        .v-responsive__content {
                            display: flex;
                            justify-content: center;
                        }
                    }
                    .check-marker {
                        position: absolute;
                        right: 0;
                        top: 0;

                        padding: 7px;
                        user-select: none;
                        cursor: pointer;
                        opacity: .7;
                    }
                    .scroller-list__title {
                        position: absolute;
                        left: 0;
                        top: 0;

                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        flex-wrap: nowrap;

                        padding: 5px;
                        height: 100%;
                        width: 100%;

                        cursor: pointer;
                        color: #fff;

                        p {
                            display: inline-block;
                            margin: 0;

                            white-space: nowrap;
                            line-height: 1.3em;
                            font-weight: bold;
                            color: inherit;

                            &:first-of-type {
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }
                        }
                    }
                }
            }
        }
        ::v-deep .scrollbar-track {
            border-radius: 4px;
            background: unset;

            .scrollbar-thumb-y {
                margin-left: 3px;
                width: 4px;
            }
        }
    }
</style>
