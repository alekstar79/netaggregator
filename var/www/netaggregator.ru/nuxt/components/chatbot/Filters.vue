<template>
    <v-card class="filter-dialog__criteria-pane" flat>
        <v-card-text class="filter-dialog__card scroller" ref="pane">
            <v-layout class="filter-dialog__list" column>
                <v-flex class="filter-dialog__list-item sex">
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

                <v-flex class="filter-dialog__list-item age">
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

                <v-flex class="filter-dialog__list-item">
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

                <v-flex class="filter-dialog__list-item">
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
                            small-chips
                            multiple
                            outlined
                            dense
                            chips
                        />
                    </div>
                </v-flex>

                <v-flex class="filter-dialog__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.cities') }}
                    </div>

                    <div class="list-item__field cities">
                        <v-combobox v-model="local.city"
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

                        <!--<v-select v-model="local.city"
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

                <v-flex class="filter-dialog__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.members') }}
                    </div>

                    <div class="list-item__field">
                        <v-select v-model="local.member.current"
                            :items="local.member.options"
                            :item-color="color"
                            :color="color"
                            hide-details
                            outlined
                            dense
                        >
                            <template #selection="{ item }">
                                {{ $t(`common.${item.text}`) }}
                            </template>
                            <template #item="{ item }">
                                {{ $t(`common.${item.text}`) }}
                            </template>
                        </v-select>
                    </div>
                </v-flex>

                <v-flex class="filter-dialog__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.firstnames') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.firstname"
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

                <v-flex class="filter-dialog__list-item">
                    <div class="list-item__row-top">
                        {{ $t('filters.lastnames') }}
                    </div>

                    <div class="list-item__field">
                        <v-combobox v-model="local.lastname"
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
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import { community, error } from '~/mixins/common'
    import { range } from '~/utils/common/range.mjs'

    import fetch from '~/mixins/common/cities.js'

    export default {
        mixins: [error, community, fetch],

        props: {
            filters: {
                required: true,
                type: Array
            }
        },
        model: {
            prop: 'filters',
            event: 'change'
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
                const age = range(100).map(n => ({ value: n, text: n }))

                age.unshift({ value: null, text: this.$t('common.notselected') })

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
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        data: () => ({
            changed: true,
            smooth: null,

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
                member: {
                    current: 0,
                    options: [
                        { value: 0, text: 'notselected' },
                        { value: 1, text: 'yes'         },
                        { value: 2, text: 'no'          }
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
                firstname: [],
                lastname: [],
                relation: [],
                city: []
            }
        }),
        watch: {
            filters() {
                this.changed = true
                this.linkData()
            },
            local: {
                deep: true,
                handler(local) {
                    let v, filters = [], changed = true

                    if (this.changed) {
                        changed = false

                        Object.keys(local).forEach(k => {
                            v = local[k]

                            if (Array.isArray(v)) {
                                if (!v.length) return

                            } else {
                                v = v.current

                                if (!v || (k === 'age' && this.emptyAge(v))) {
                                    return
                                }
                            }

                            filters.push({ value: v, text: k })
                        })

                        this.$emit('change', filters)
                    }

                    this.changed = changed
                }
            }
        },
        methods: {
            emptyAge(age)
            {
                return JSON.stringify({ from: null, to: null }) === JSON.stringify(age)
            },
            linkData()
            {
                let d, local = {}, changed = true

                if (this.changed) {
                    changed = false

                    Object.keys(this.local).forEach(k => {
                        const options = k => (k === 'age' ? {} : { options: this.local[k].options }),
                            v = (this.filters.find(f => f.text === k) || {}).value

                        if (Array.isArray(this.local[k])) {
                            local[k] = v || []
                            return
                        }

                        d = k === 'age' ? { from: null, to: null } : 0

                        local[k] = { current: v || d, ...options(k) }
                    })

                    this.local = local
                }

                this.changed = changed
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
        created()
        {
            this.getCitiesStub().then(this.linkData)
        },
        mounted()
        {
            this.$nextTick().then(this.initScroll)
        }
    }
</script>

<style lang="scss" scoped>
    .filter-dialog__criteria-pane {
        .filter-dialog__card {
            max-height: 600px;
            padding: 0 10px;

            &.os-host::v-deep {
                max-height: calc(100vh - 90px);
            }

            .filter-dialog__list,
            ::v-deep .scroll-content .filter-dialog__list,
            ::v-deep .os-content .filter-dialog__list {
                .flex.filter-dialog__list-item {
                    padding: 7px;

                    .list-item__field {
                        .v-select.v-text-field {
                            .v-input__slot {
                                .v-select__slot .v-select__selections {
                                    color: #7a7a7a;

                                    .v-select__selection--comma {
                                        color: unset;
                                    }
                                }
                                fieldset {
                                    border: 2px solid;
                                }
                                &:hover {
                                    fieldset {
                                        color: #7a7a7a;
                                    }
                                }
                            }
                        }
                    }
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
            .filter-dialog__card {
                ::v-deep .scrollbar-track {
                    .scrollbar-thumb {
                        background: #424242;
                    }
                }
            }
        }
    }
</style>
