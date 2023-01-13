<template>
    <v-card class="widget__save-list" elevation="0">
        <v-card-text class="save-list__panel scroller" ref="list">
            <v-layout v-if="!widgets.length" class="list-empty">
                {{ $t('widget.saved_list') }}
            </v-layout>

            <v-layout v-else class="save-list__panel-list" column>
                <div v-for="(w, i) in widgets" @click="choose(w)" class="save-list__panel-item" :key="`sl-${i}-${w}`">
                    <div class="save-list__panel-item--icon">
                        <widget-icon :target="gettype(w)" />
                    </div>

                    <div class="save-list__panel-item--data">
                        {{ w | extract($store) }}
                    </div>

                    <div @click.stop="del(w)" class="save-list__panel-item--del">
                        <v-icon dense>mdi-close</v-icon>
                    </div>
                </div>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { common, loader, storage, error } from '~/mixins/widget'
    import cloneDeep from 'lodash/cloneDeep'

    export default {
        mixins: [error, common, loader, storage],

        filters: {
            extract(w, store)
            {
                return store.state.widget.save[w].appellation
            }
        },
        computed: {
            widgets() {
                return Object.keys(this.$store.state.widget.save)
            }
        },
        data: () => ({
            smooth: null
        }),
        methods: {
            getdata(w)
            {
                return cloneDeep(this.$store.state.widget.save[w])
            },
            gettype(w)
            {
                return w.split('-').pop()
            },
            choose(widget)
            {
                this.promises = []

                const { active } = this.$store.state.context,
                    data = this.getdata(widget),
                    type = this.gettype(widget)

                if (this.isImaged(type)) {
                    this.checkImages(data, type)
                }

                this.proceed().then(() => {
                    this.$store.commit('widget/reset')
                    this.widget[type] = data
                    this.entity = type

                    this.$bus.$emit('context:on-change', { icon: type })

                    this.$store.commit('context/set', {
                        active: { ...active, widget: type }
                    })
                })
            },
            clear()
            {
                this.keys().then(this.save)
            },
            del(key)
            {
                this.remove({ key })
            },
            initScroll()
            {
                if (this.smooth || !this.$refs.list) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$refs.list, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' }
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$refs.list, {
                                damping: this.mobile ? .5 : 1,
                                continuousScrolling: false
                            })

                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            }
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)
        }
    }
</script>

<style lang="scss" scoped>
    .widget__save-list {
        position: absolute;
        width: calc(100% - 27px);
        height: calc(100% - 30px);

        .save-list__panel {
            box-sizing: border-box;
            max-height: 345px;
            height: 100%;
            padding: 0;

            .save-list__panel-item {
                padding: 10px;
                width: 100%;

                border-radius: 5px;
                white-space: nowrap;
                overflow: hidden;

                line-height: 30px;
                font-weight: 400;

                .save-list__panel-item--data,
                .save-list__panel-item--icon {
                    display: inline-block;
                    vertical-align: middle;

                    color: #999;

                    & > svg {
                        margin-right: 15px;
                        vertical-align: middle;
                    }
                }
                .save-list__panel-item--del {
                    display: none;
                    float: right;

                    & > svg {
                        vertical-align: middle;
                        fill: #aaa;
                    }
                }
                ::v-deep .v-icon {
                    margin-right: 15px;
                    vertical-align: middle;
                }
                &:hover {
                    background: #fafbfc;
                    cursor: pointer;

                    .save-list__panel-item--del {
                        display: block;
                    }
                }
            }
            ::v-deep .scroll-content {
                margin-right: 15px;
            }
            .list-empty {
                justify-content: center;
                padding: 30px 0;
                color: #999;
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
        &.theme--dark {
            .save-list__panel {
                .save-list__panel-item:hover {
                    background-color: #424242;
                }
            }
            .save-list__panel-item--data,
            .save-list__panel-item--icon,
            .list-empty {
                color: #7a7a7a;
            }
        }
    }
</style>
