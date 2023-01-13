<template>
    <v-card class="widget__panel-readers" flat>
        <v-card-text class="panel-readers__card scroller" ref="pane">
            <v-layout class="panel-readers__list" column>
                <v-flex class="panel-readers__list-item sex">
                    <div class="list-item__row-top">
                        {{ $t('filters.sex') }}
                    </div>

                    <div class="list-item__field">
                        <v-select v-model="local.sex.current"
                            :items="local.sex.options"
                            :item-color="color"
                            :color="color"
                            hide-details
                            outlined
                            dense
                        >
                            <template #selection="{ item }">
                                {{ $t(`filters.${item.text}`) }}
                            </template>
                            <template #item="{ item }">
                                {{ $t(`filters.${item.text}`) }}
                            </template>
                        </v-select>
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item age">
                    <div class="list-item__row-top">
                        {{ $t('filters.age') }}
                    </div>

                    <div class="list-item__field">
                        <v-layout justify-space-between>
                            <v-select v-model="local.age.current.from"
                                :label="$t('filters.from')"
                                :item-color="color"
                                :color="color"
                                :items="age"
                                hide-details
                                outlined
                                dense
                            />
                            <v-select v-model="local.age.current.to"
                                :label="$t('filters.upto')"
                                :item-color="color"
                                :color="color"
                                :items="age"
                                hide-details
                                outlined
                                dense
                            />
                        </v-layout>
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.birthday') }}
                    </div>

                    <div class="list-item__field">
                        <v-select v-model="local.bdate.current"
                            :items="local.bdate.options"
                            :item-color="color"
                            :color="color"
                            hide-details
                            outlined
                            dense
                        >
                            <template #selection="{ item }">
                                {{ $t(`filters.${item.text}`) }}
                            </template>
                            <template #item="{ item }">
                                {{ $t(`filters.${item.text}`) }}
                            </template>
                        </v-select>
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.family') }}
                    </div>

                    <div class="list-item__field relation">
                        <v-select v-model="local.relation"
                            :placeholder="$t('filters.notselected')"
                            :item-color="color"
                            :color="color"
                            :items="rlist"
                            hide-details
                            multiple
                            outlined
                            dense
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.cities') }}
                    </div>

                    <div class="list-item__field cities">
                        <v-combobox v-model="local.cities"
                            :placeholder="$t('filters.notselected')"
                            :item-color="color"
                            :color="color"
                            :items="clist"
                            item-text="title"
                            item-value="id"
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                        />

                        <!--<v-select v-model="local.cities"
                            :placeholder="$t('filters.notselected')"
                            :item-color="color"
                            :color="color"
                            :items="clist"
                            item-text="title"
                            item-value="id"
                            hide-details
                            small-chips
                            multiple
                            outlined
                            dense
                            chips
                        />-->
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.platform') }}
                    </div>

                    <div class="list-item__field platform">
                        <v-select v-model="local.platform"
                            :placeholder="$t('filters.notselected')"
                            :item-color="color"
                            :color="color"
                            :items="plist"
                            hide-details
                            small-chips
                            multiple
                            outlined
                            dense
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.members') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.member"
                            :placeholder="$t('filters.cid')"
                            :item-color="color"
                            :color="color"
                            :rules="[digit]"
                            append-icon=""
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.not_members') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.notmember"
                            :placeholder="$t('filters.cid')"
                            :item-color="color"
                            :color="color"
                            :rules="[digit]"
                            append-icon=""
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.interests') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.interests"
                            :placeholder="$t('common.keywords')"
                            :item-color="color"
                            :color="color"
                            append-icon=""
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.firstnames') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.firstnames"
                            :placeholder="$t('filters.firstnames')"
                            :item-color="color"
                            :color="color"
                            append-icon=""
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.lastnames') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.lastnames"
                            :placeholder="$t('filters.lastnames')"
                            :item-color="color"
                            :color="color"
                            append-icon=""
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="panel-readers__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.personally') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.users"
                            :placeholder="$t('filters.uid')"
                            :item-color="color"
                            :color="color"
                            :rules="[digit]"
                            append-icon=""
                            deletable-chips
                            hide-details
                            small-chips
                            multiple
                            outlined
                            chips
                        />
                    </div>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { common, error } from '~/mixins/widget'
    import { range } from '~/utils/common/range.mjs'

    import fetch from '~/mixins/common/cities.js'

    export default {
        mixins: [error, common, fetch],

        props: {
            fullscreen: {
                required: true,
                type: Boolean
            }
        },
        computed: {
            clist: {
                set(clist) {
                    this.$store.commit('app/set', { clist })
                },
                get() {
                    return this.$store.state.app.clist
                }
            },
            age() {
                const age = range(100).map(n => ({ value: n, text: n })),
                    text = this.$t('common.notselected')

                age.unshift({ value: null, text })

                return age
            },
            rlist() {
                return [
                    { value: 1, text: this.$t('filters.single')         },
                    { value: 2, text: this.$t('filters.dating')         },
                    { value: 3, text: this.$t('filters.engaged')        },
                    { value: 4, text: this.$t('filters.married')        },
                    { value: 5, text: this.$t('filters.complicated')    },
                    { value: 6, text: this.$t('filters.looking')        },
                    { value: 7, text: this.$t('filters.inlove')         },
                    { value: 8, text: this.$t('filters.civil_marriage') }
                ]
            },
            paddingBottom() {
                return this.fullscreen ? '70px' : null
            },
            color() {
                return this.$store.state.app.color
            },
            readers: {
                get() {
                    return this.data.readers || {}
                },
                set(v) {
                    this.data.readers = v
                }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        data: () => ({
            unwatchers: [],
            smooth: null,
            error: false,
            valve: false,

            plist: [
                { value: 'web',     text: 'Web'     },
                { value: 'mobile',  text: 'Mobile'  },
                { value: 'android', text: 'Android' },
                { value: 'iphone',  text: 'iPhone'  }
            ],
            local: {
                age: {
                    current: { from: null, to: null }
                },
                bdate: {
                    current: 0,
                    options: [
                        { value: 0, text: 'notselected' },
                        { value: 7, text: 'days7'       },
                        { value: 3, text: 'days3'       },
                        { value: 1, text: 'today'       }
                    ]
                },
                sex: {
                    current: 0,
                    options: [
                        { value: 0, text: 'notselected' },
                        { value: 1, text: 'female'      },
                        { value: 2, text: 'male'        }
                    ]
                },
                firstnames: [],
                lastnames: [],
                interests: [],
                notmember: [],
                platform: [],
                relation: [],
                member: [],
                cities: [],
                users: []
            }
        }),
        watch: {
            readers: 'linkData',

            'local.cities': {
                handler: 'filterCities',
                deep: true
            }
        },
        methods: {
            filterCities(v)
            {
                if (this.valve) return this.valve = false

                const cities = v.filter(c => typeof c === 'object')

                if (this.local.cities !== cities) {
                    this.local.cities = cities
                    this.valve = true
                }
            },
            digit(v)
            {
                this.error = v.map(Number).some(isNaN)

                return this.error
                    ? this.$t('common.numeric')
                    : true
            },
            merge(k)
            {
                this.readers[k].current = this.local[k].current
            },
            assign(k)
            {
                this.readers[k] = this.local[k]
            },
            presence(k)
            {
                return k in this.readers
            },
            linkData()
            {
                Object.keys(this.local).forEach(k => {
                    if (!this.presence(k)) return

                    if (Array.isArray(this.readers[k])) {
                        this.local[k] = this.readers[k]
                        return
                    }

                    this.local[k].current = this.readers[k].current
                })
            },
            initScroll()
            {
                if (this.smooth || !this.$refs.pane) return

                if (this.mobile) {
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars/css/OverlayScrollbars.css')
                    import(/* webpackChunkName: "overlayscrollbars" */ 'overlayscrollbars')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar(this.$refs.pane, {
                                scrollbars: { visibility: this.mobile ? 'hidden' : 'auto' }
                            })
                        })

                } else {
                    import(/* webpackChunkName: "smooth-scrollbar" */ 'smooth-scrollbar')
                        .then(m => m.default || m)
                        .then(Scrollbar => {
                            this.smooth = Scrollbar.init(this.$refs.pane, {
                                damping: this.mobile ? .1 : 1,
                                continuousScrolling: false
                            })

                            this.smooth.updatePluginOptions('overscroll', {
                                enable: false
                            })
                        })
                }
            }
        },
        beforeDestroy()
        {
            this.unwatchers.map(u => u())
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)
        },
        created()
        {
            this.getCitiesStub().then(this.linkData)

            Object.keys(this.local).forEach(k => {
                if (!this.presence(k)) return

                this.unwatchers.push(this.$watch(`local.${k}`, () => {
                    Array.isArray(this.local[k]) ? this.assign(k) : this.merge(k)
                }, { deep: true }))
            })
        }
    }
</script>

<style lang="scss" scoped>
    .widget__panel-readers {
        .panel-readers__card {
            max-height: 600px;
            padding: 0 10px;

            &.os-host::v-deep {
                max-height: calc(100vh - 90px);
            }

            .panel-readers__list,
            ::v-deep .scroll-content .panel-readers__list,
            ::v-deep .os-content .panel-readers__list {
                .flex.panel-readers__list-item {
                    padding: 7px;

                    .list-item__field {
                        .v-select.v-text-field {
                            .v-select__selections {
                                color: #7a7a7a;

                                .v-select__selection--comma {
                                    color: unset;
                                }
                            }
                        }
                    }
                    .list-item__field.platform .v-input,
                    .list-item__field.relation .v-input,
                    .list-item__field.cities .v-input {
                        @include placeholder(#7a7a7a);

                        .v-select__selections {
                            input[placeholder] {
                                max-height: 40px;
                                height: 40px;
                            }
                        }
                        &.v-input--is-dirty {
                            @include placeholder(transparent);
                        }
                    }
                    .v-text-field .v-input__slot fieldset {
                        border: 2px solid;
                    }
                    &.age .v-text-field {
                        flex: unset;
                        width: 45%;
                    }
                }
            }
            ::v-deep .scrollbar-track-y {
                background: none;

                .scrollbar-thumb-y {
                    margin-left: 3px;
                    width: 4px;
                }
            }
        }
        &.theme--dark {
            .panel-readers__card {
                ::v-deep .scrollbar-track {
                    .scrollbar-thumb {
                        background: #424242;
                    }
                }
            }
        }
    }
</style>
