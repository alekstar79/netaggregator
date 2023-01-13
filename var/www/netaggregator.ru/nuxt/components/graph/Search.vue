<template>
    <div class="pixabay-content fill-height" :class="{ mobile, [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true }">
        <div class="pixabay pixabay-search" @click.stop="">
            <v-text-field v-model="query"
                @change="search"
                @input="search"
                :color="color"
                :label="$t('graph.search')"
                class="graph-ed-search"
                hide-details
                flat
            />

            <v-icon v-if="close" @click="$emit('close')" class="close-btn">
                mdi-close
            </v-icon>
        </div>

        <div class="d-flex pixabay-list scroller" ref="panel">
            <v-layout v-if="images.length" class="pixabay-list__images" wrap ref="wrapper">
                <div v-for="(item, i) in images" class="flex pixabay-list__images--item xs6 sm4" :key="i" ref="tile">
                    <v-card tile flat>
                        <v-img :src="item.previewURL" @click="$emit('choose', item)" aspect-ratio="1" min-width="90px">
                            <div @click.stop="view(i)" class="view-marker">
                                <v-icon color="#fff" dense>
                                    mdi-eye-outline
                                </v-icon>
                            </div>
                        </v-img>
                    </v-card>
                </div>
            </v-layout>
            <v-layout v-else class="pixabay-list__images empty-list" justify-center>
                <v-card tile flat>
                    <lazy-graph-pixaby />
                    <span v-if="!service">
                        Service is not available
                    </span>
                </v-card>
            </v-layout>
        </div>
    </div>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'
    // import { rclamp } from '~/utils/common/clamp.mjs'

    let query = ''

    export default {
        props: {
            close: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            cache() {
                return this.$store.state.canvas.cache
            }
        },
        data: () => ({
            key: process.env.PIXABAY_KEY,
            api: process.env.PIXABAY_API,

            perform: false,
            service: true,
            smooth: null,

            images: [],
            query: '',
            total: 0,
            page: 0,

            wrapperHeight: 0,
            panelHeight: 0,
            tileHeight: 0,
            height: 0
        }),
        watch: {
            images: 'initScroll',

            query(value) {
                if (value === '') {
                    this.clear()
                }
            }
        },
        methods: {
            valid({ status, data })
            {
                const query = `${this.query}p${this.page}`

                if (!status || status !== 200) {
                    this.$bus.$emit('snack', { content: 'graph.error_service', color: 'error' })
                    return false
                }
                if (!data || parseInt(data.totalHits) === 0) {
                    this.$bus.$emit('snack', { content: 'graph.search_not_match', color: 'warning' })
                    return false
                }
                if (this.cache[query] === undefined) {
                    this.$store.commit('canvas/set', { cache: { ...this.cache, [query]: data } })
                }

                return true
            },
            fromCache()
            {
                const { cache, query, page } = this

                if (cache[`${query}p${page}`] !== undefined) {
                    this.total = cache[`${query}p${page}`].totalHits
                    this.images = [...this.images, ...cache[`${query}p${page}`].hits]
                    return true
                }

                return false
            },
            requestsPreAnalysis(test)
            {
                if (this.perform) return false

                if (test) {
                    query = 'summer'
                    this.page = 1
                    return true
                }
                if (this.query !== query) {
                    query = this.query

                    this.total = this.page = 0
                    this.images = []

                    this.measure()

                    if (!this.query) {
                        return false
                    }
                }
                if (++this.page > 3) {
                    this.page--
                }

                return !this.fromCache()
            },
            search(_, test = false)
            {
                if (!this.requestsPreAnalysis(test)) return

                this.perform = true

                this.$axios.get(this.api, {
                    crossDomain: true,
                    timeout: 5000,
                    params: {
                        q: test ? 'summer' : this.query,
                        per_page: 200,
                        page: this.page,
                        key: this.key
                    }
                })
                    .then(response => {
                        this.service = true

                        if (this.valid(response) && !test) {
                            this.total = response.data.totalHits
                            this.images = [...this.images, ...response.data.hits]
                            this.measure()
                        }
                    })
                    .catch(({ message }) => {
                        if (/timeout/.test(message)) {
                            this.service = false
                        }
                    })
                    .finally(() => {
                        this.perform = false
                    })
            },
            measure()
            {
                setTimeout(() => {
                    this.wrapperHeight = this.$refs.wrapper?.clientHeight || 0
                    this.panelHeight = this.$refs.panel?.clientHeight || 0

                    let tile, height = this.wrapperHeight - this.panelHeight

                    if (height >= 0) {
                        this.height = height
                    }
                    if ((tile = (this.$refs.tile || [])[0])) {
                        this.tileHeight = Math.floor(tile.clientHeight) || 100
                    }
                })
            },
            clear()
            {
                this.total = this.page = 0

                this.images = []
            },
            view(curr)
            {
                let frame = this.images.map(img => ({ src: img.largeImageURL })),
                    oc = 3 * Math.ceil(this.smooth.offset.y / this.tileHeight) - 3,
                    pc = 3 * Math.ceil(this.panelHeight / this.tileHeight),
                    src = frame[curr]?.src

                this.smooth.offset.y > this.tileHeight || (oc = 0)

                oc > 0 || (oc = 0)

                if (!frame[curr]) {
                    return this.$bus.$emit('snack', { content: 'Internal error', color: 'error', raw: true })
                }
                if (frame.length <= pc) {
                    return this.$bus.$emit('view', {
                        idx: frame.findIndex(p => p.src === src),
                        frame
                    })
                }

                frame = frame.slice(oc, oc + pc)

                this.$bus.$emit('view', {
                    idx: frame.findIndex(p => p.src === src),
                    frame
                })
            },
            /* view(curr)
            {
                let div, frame = [],

                    src = this.images[curr].largeImageURL,
                    ln = this.images.length - 1,

                    prev = rclamp(curr - 4, 0, curr),
                    next = ((div = 4 - (curr - prev)))
                        ? rclamp(curr + 4 + div, curr + div, ln)
                        : rclamp(curr + 4, curr, ln)

                if ((div = 4 - (next - curr)) > 0) {
                    prev = rclamp(prev - div, 0, prev)
                }

                frame = this.images.slice(prev, next + 1)
                    .map(img => ({
                        src: img.largeImageURL
                    }))

                this.$bus.$emit('view', {
                    idx: frame.findIndex(p => p.src === src),
                    frame
                })
            }, */
            initScroll()
            {
                if (this.smooth || !this.$refs.panel) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$refs.panel, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' },
                                callbacks: { onScroll: this.handleScroll }
                            })
                        })
                        .then(this.measure)

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$refs.panel, {
                                damping: this.mobile ? .1 : 1,
                                continuousScrolling: false
                            })

                            this.smooth.addListener(this.handleScroll)
                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                        .then(this.measure)
                }
            },
            handleScroll({ offset = this.smooth.scroll().position } = {})
            {
                if (!offset.y || (this.height - offset.y) > (.7 * this.panelHeight)) return

                if (this.total > this.images.length) {
                    this.search()
                }
            }
        },
        created()
        {
            this.search('summer', true)

            this.search = debounce.call(this, this.search, 1000)
        }
    }
</script>

<style lang="scss" scoped>
    .pixabay-content {
        display: flex;
        flex-direction: column;
        padding: 10px 0 10px 10px;
        background-color: #fff;

        .pixabay.pixabay-search {
            padding: 0 12px 0 0;
            margin-bottom: 10px;

            .graph-ed-search {
                .v-input__control > .v-input__slot {
                    padding: 0 10px !important;

                    input {
                        box-shadow: inset 0 0 0 40px rgba(255,255,255,1);
                    }
                }
                &.theme--dark {
                    .v-input__control > .v-input__slot input {
                        box-shadow: none;
                    }
                }
            }
            .close-btn {
                position: absolute;
                right: 10px;
                top: 10px;

                cursor: pointer;
            }
        }
        .pixabay-list {
            position: relative;
            align-items: flex-start;
            margin-left: -10px;
            height: 100%;

            ::v-deep .scrollbar-track-y {
                background: none;

                .scrollbar-thumb-y {
                    margin-left: 1px;
                    width: 4px;
                }
            }
            ::v-deep .scroll-content {
                height: 100%;
                width: 100%;
            }
            .pixabay-list__images {
                padding: 0 7px;

                .pixabay-list__images--item {
                    padding: 3px;
                    cursor: pointer;

                    .v-image.v-responsive {
                        max-width: unset;

                        .v-responsive__content {
                            background-color: rgba(50, 50, 50, .3);
                            transition: background-color .5s;
                        }
                        &:hover .v-responsive__content {
                            background-color: transparent;
                        }
                        .view-marker {
                            position: absolute;
                            right: 10px;
                            top: 5px;

                            user-select: none;
                            cursor: pointer;
                            opacity: .7;
                        }
                    }
                }
                &.empty-list {
                    align-items: center;
                    height: 100%;
                    width: 100%;
                }
            }
        }
        &.theme--dark {
            background-color: #1e1e1e;

            ::v-deep .scrollbar-thumb {
                background: #FFF;
            }
        }
    }
</style>
