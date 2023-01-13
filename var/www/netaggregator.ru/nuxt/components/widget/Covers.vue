<template>
    <v-layout justify-center>
        <material-card class="module widget-covers" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 5 }" class="widget-header__title pa-3">
                        {{ $t('widget.covers') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools @toggle="assignEntity" v-on="$listeners" />
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header v-model="value" v-on="$listeners" />

            <v-layout class="module-body" column>
                <v-flex v-for="(item, i) in value.rows || []" :key="`covers-${i}`" class="module-body__cover-row">
                    <div class="module-body__cover--image-wrapper" @click="openLoader(item, '510x128')">
                        <v-img :src="item.src" aspect-ratio="3.98" class="module-body__cover--image" alt="image" />

                        <div class="module-body__cover--overlay">
                            1530x384
                        </div>

                        <v-btn v-if="value.rows && value.rows.length > 1"
                            class="cross-button cover"
                            @click.stop="removeRow(i)"
                            :ripple="false"
                            icon
                        >
                            <v-icon x-small>
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </div>

                    <v-layout class="module-body__cover--controls" wrap>
                        <v-flex class="module-body__cover--content">
                            <div @click="openDialog(item, { name: 'title', link: 'title_url' })"
                                class="module-body__cover--title linked"
                            >
                                {{ item.title || $t('widget.header') }}
                            </div>

                            <lazy-widget-text-field
                                v-if="stub[i].descr"
                                v-model="item.descr"
                                v-click-outside="clickOutside.bind(_self, i)"
                                :rules="[v => v.length > 100 ? $t('widget.more_100') : true]"
                                class="module-body__cover--info"
                                hide-details
                            />
                            <div v-else
                                v-text="item.descr || $t('widget.description_100')"
                                @click.stop="stub[i].descr = true"
                                class="module-body__cover--info"
                            />
                        </v-flex>

                        <v-btn @click.stop="openDialog(item, { name: 'button', link: 'button_url', ln: 50, both: true })"
                            class="flat_button module-body__cover--button shadowless"
                            small
                        >
                            {{ item.button || $t('widget.button') }}
                        </v-btn>
                    </v-layout>
                </v-flex>

                <div v-if="!value.rows || value.rows.length < 3" class="flat_btn add-item__btn slim mt-2" @click="addRow">
                    <span class="load-more__btn--label">+</span>
                </div>
            </v-layout>

            <div @click="openDialog(value, { name: 'more', link: 'more_url', ln: 100, both: true })"
                class="flat_btn load-more__btn"
            >
                <span class="load-more__btn--label">
                    {{ value.more || $t('widget.button') }}
                </span>
            </div>

            <lazy-widget-link-dialog v-model="link" :set="set" @update="handler" />
            <lazy-widget-load-dialog v-model="load" :set="set" @update="handler" />
        </material-card>
    </v-layout>
</template>

<script>
    import { common, error } from '~/mixins/widget'
    import { extendComputed } from '~/utils/widget'
    import { cover } from '~/assets/data/widget'

    export default {
        mixins: [error, common],

        computed: {
            ...extendComputed('cover_list'),

            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'clear',

            stub: {
                deep: true,
                handler() {
                    this.$emit('update')
                }
            }
        },
        data: () => ({
            handler: () => {},

            human: 'male',

            link: false,
            load: false,

            stub: [],
            set: {}
        }),
        methods: {
            clickOutside(i)
            {
                this.stub[i] && (this.stub[i].descr = false)
            },
            assignEntity(entity)
            {
                this.human = entity
            },
            addRow()
            {
                this.value = { ...this.value, rows: [].concat(this.value.rows || [], [cover()]) }

                this.clear()
            },
            removeRow(idx)
            {
                this.value = { ...this.value, rows: [].concat(this.value.rows || []).filter((_,i) => i !== idx) }

                this.clear()
            },
            openDialog(value, { name, link, ln = 100, both = false })
            {
                this.set = { name: value[name], link: value[link], ln, both }

                this.handler = set => {
                    this.link = false

                    if (set.close) return

                    value[name] = set.name
                    value[link] = set.link
                }

                this.link = true
            },
            openLoader(item, type)
            {
                this.set = { type, widget: 'cover_list' }

                this.handler = set => {
                    this.load = false

                    if (set) {
                        item.src = set.id ? set.images[set.images.length - 1].url : '/img/icons/1530x384.jpg'
                        item.cover_id = set.id
                    }
                }

                this.load = true
            },
            clear()
            {
                this.stub = Array.from((this.value.rows || []), () => ({ descr: false }))
            }
        },
        mounted()
        {
            this.$emit('update')
        },
        created()
        {
            this.clear()
        }
    }
</script>

<style lang="scss" scoped>
    .widget-covers {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 15px 0;

                .module-body__cover-row {
                    position: relative;
                    margin-top: 10px;

                    .cross-button {
                        height: 17px;
                        width: 17px;

                        transition: opacity 40ms linear;
                        background-color: #f0f2f5;
                        opacity: 0;

                        &.cover {
                            position: absolute;
                            right: 10px;
                            top: 10px;
                        }
                    }
                    &:hover .cross-button {
                        opacity: 1;
                    }
                    &:first-child {
                        margin-top: 0;
                    }
                    &:last-child {
                        margin-bottom: 0;
                    }
                    .module-body__cover--image-wrapper {
                        position: relative;
                        cursor: pointer;

                        &:hover .module-body__cover--overlay {
                            opacity: .5;
                        }
                        .module-body__cover--image {
                            display: block;
                            height: 128px;
                            width: 100%;

                            background-position: 50%;
                            background-size: cover;
                            vertical-align: middle;
                        }
                        .module-body__cover--overlay {
                            position: absolute;
                            left: 0;
                            top: 0;

                            height: 100%;
                            width: 100%;

                            transition: opacity 40ms linear;
                            background-color: #000;
                            color: white;
                            opacity: 0;

                            text-align: center;
                            line-height: 128px;
                            font-size: 1.2rem;
                        }
                    }
                    .module-body__cover--controls {
                        position: absolute;
                        display: flex;
                        bottom: 10px;
                        right: 10px;
                        left: 10px;

                        .module-body__cover--title,
                        .module-body__cover--info {
                            padding-top: 0;

                            text-decoration: none;
                            line-height: 15px;
                            font-weight: 400;
                            color: #fff;

                            -webkit-font-smoothing: subpixel-antialiased;
                                           -moz-osx-font-smoothing: auto;
                            &.linked {
                                cursor: pointer;
                            }
                        }
                        .module-body__cover--button,
                        .module-body__cover--title,
                        .module-body__cover--info {
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            overflow: hidden;
                            max-width: 100%;
                        }
                        .module-body__cover--button {
                            align-self: flex-end;
                            min-width: 150px;
                            margin: 5px 0 0 7px;
                            padding: 0;

                            background-color: #0f9d58 !important;
                            color: white;
                        }
                    }
                }
            }
        }
        &.theme--dark {
            .widget-header {
                color: #7a7a7a;

                ::v-deep .header-tools {
                    .v-btn.v-btn--icon {
                        color: #7a7a7a;
                    }
                }
            }
            ::v-deep .v-card__text {
                .module-header .module-header__top-label {
                    color: #7a7a7a;
                }
                .module-body {
                    .module-body__cover-row {
                        .module-body__cover--title,
                        .module-body__cover--info {
                            color: #7a7a7a;
                        }
                        .module-body__cover--image-wrapper {
                            &:hover + .module-body__cover--controls {
                                .module-body__cover--title,
                                .module-body__cover--info {
                                    color: #fff;
                                }
                            }
                        }
                    }
                }
                .load-more__btn,
                .module-body .add-item__btn {
                    &:not(.slim) {
                        border-top: 1px solid #424242;
                    }

                    background-color: #1e1e1e;
                    color: #7a7a7a;

                    &:hover {
                        background-color: #424242;
                    }
                }
            }
        }
    }
</style>
