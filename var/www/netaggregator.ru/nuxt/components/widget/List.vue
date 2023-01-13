<template>
    <v-layout justify-center>
        <material-card class="module widget-list" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 2 }" class="widget-header__title pa-3">
                        {{ $t('widget.cards') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools @toggle="assignEntity" v-on="$listeners">
                            <template #addon>
                                <v-tooltip :disabled="mobile" nudge-bottom="60">
                                    <template #activator="{ on }">
                                        <v-btn v-on="on" @click="viewToggle" class="addon" aria-label="resize" icon>
                                            <v-icon dense>mdi-resize</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('tooltip.view_switcher') }}</span>
                                </v-tooltip>
                            </template>
                        </lazy-widget-header-tools>
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header v-model="value" v-on="$listeners" />

            <v-layout class="module-body" column>
                <v-flex v-for="(item, i) in value.rows || []" :key="`list-${i}`" class="module-body__list-row">
                    <div class="module-body__list--icon">
                        <div @click="openLoader(item, '50x50')" class="avatar-wrapper">
                            <v-avatar size="50">
                                <img :src="item.src" width="50px" height="50px" alt="icon">
                            </v-avatar>

                            <div class="avatar-overlay">+</div>
                        </div>
                    </div>

                    <div class="module-body__list-content">
                        <div class="module-body__list-content--outer">
                            <div class="module-body__list-content--inner">
                                <div class="module-body__list--title module-body_linked">
                                    <span @click="openDialog(item, { name: 'title', link: 'title_url' })">
                                        {{ item.title || $t('widget.header') }}
                                    </span>

                                    <v-btn
                                        v-if="value.rows && value.rows.length > 1"
                                        class="cross-button"
                                        @click="removeRow(i)"
                                        :ripple="false"
                                        icon
                                    >
                                        <v-icon x-small>
                                            mdi-close
                                        </v-icon>
                                    </v-btn>
                                </div>

                                <lazy-widget-text-field
                                    v-if="stub[i].address"
                                    v-model="item.address"
                                    v-click-outside="clickOutside.bind(_self, i, 'address')"
                                    class="module-body__input--info address"
                                    :rules="[v => v.length > 100 ? $t('widget.more_100') : true]"
                                />
                                <div v-else
                                    v-text="item.address || $t('widget.address_100')"
                                    @click.stop="stub[i].address = true"
                                    class="module-body__list--info address"
                                />
                                <lazy-widget-text-field
                                    v-if="stub[i].time"
                                    v-model="item.time"
                                    v-click-outside="clickOutside.bind(_self, i, 'time')"
                                    class="module-body__input--info time"
                                    :rules="[v => v.length > 100 ? $t('widget.more_100') : true]"
                                />
                                <div v-else
                                    v-text="item.time || $t('widget.time_100')"
                                    @click.stop="stub[i].time = true"
                                    class="module-body__list--info time"
                                />
                                <lazy-widget-text-field
                                    v-if="stub[i].text"
                                    v-model="item.text"
                                    v-click-outside="clickOutside.bind(_self, i, 'text')"
                                    class="module-body__input--text"
                                    :rules="[v => v.length > 300 ? $t('widget.more_300') : true]"
                                />
                                <div v-else
                                    v-text="item.text || $t('widget.description_300')"
                                    @click.stop="stub[i].text = true"
                                    class="module-body__list--text"
                                />
                                <v-btn v-text="item.button || $t('widget.button')"
                                    @click="openDialog(item, { name: 'button', link: 'button_url', ln: 50, both: true })"
                                    class="module-body__list-button shadowless"
                                    :class="{ compact }"
                                    small
                                />
                            </div>
                        </div>
                    </div>
                </v-flex>

                <div v-if="!value.rows || value.rows.length < 3" class="flat_btn add-item__btn slim" @click="addRow">
                    <span class="load-more__btn--label">+</span>
                </div>
            </v-layout>

            <div @click="openDialog(value, { name: 'more', link: 'more_url', ln: 100, both: true })" class="flat_btn load-more__btn">
                <span class="load-more__btn--label">
                    {{ value.more || $t('widget.footer') }}
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
    import { listrow } from '~/assets/data/widget'

    export default {
        mixins: [error, common],

        computed: {
            ...extendComputed('list'),

            compact: {
                set(compact) {
                    this.value = { ...this.value, compact }
                },
                get() {
                    return this.value.compact
                }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'clear',

            compact(v) {
                this.value = { ...this.value, type: v ? 'compact_list' : 'list' }
            },
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
            clickOutside(i, field)
            {
                this.stub[i] && (this.stub[i][field] = false)
            },
            viewToggle()
            {
                this.compact = !this.compact
            },
            addRow()
            {
                this.value = { ...this.value, rows: [].concat(this.value.rows || [], [listrow()]) }

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
                this.set = { type, widget: 'list' }

                this.handler = set => {
                    this.load = false

                    if (set) {
                        item.src = set.id ? set.images[set.images.length - 1].url : '/img/icons/150x150.png'
                        item.icon_id = set.id
                    }
                }

                this.load = true
            },
            assignEntity(entity)
            {
                this.human = entity
            },
            clear()
            {
                this.stub = Array.from((this.value.rows || []), () => ({ address: false, time: false, text: false }))
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
    .widget-list {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 12px 15px 15px;

                .module-body__list-row {
                    position: relative;
                    display: flex;
                    padding: 15px 0;

                    line-height: 19px;
                    color: #000;

                    & + .module-body__list-row {
                        border-top: 1px solid #e7e8ec;
                    }
                    .cross-button {
                        height: 17px;
                        width: 17px;

                        background-color: #f0f2f5;
                        transition: opacity 40ms linear;
                        opacity: 0;
                    }
                    &:hover .cross-button {
                        opacity: 1;
                    }
                    &:first-child {
                        padding-top: 0;
                    }
                    &:last-child {
                        padding-bottom: 0;
                        border-bottom: 0;
                    }

                    .module-body__list--icon {
                        padding-right: 12px;

                        .avatar-wrapper {
                            position: relative;
                            height: 50px;
                            width: 50px;

                            cursor: pointer;

                            .avatar-overlay {
                                position: absolute;
                                left: 0;
                                top: 0;

                                height: 100%;
                                width: 100%;

                                border-radius: 50%;
                                transition: opacity 40ms linear;
                                background-color: #000;

                                font-size: 2rem;
                                line-height: 50px;
                                text-align: center;
                                color: white;

                                opacity: 0;
                            }
                            &:hover .avatar-overlay {
                                opacity: .5;
                            }
                        }
                    }
                    .module-body__list-content {
                        word-wrap: break-word;
                        overflow: hidden;

                        .module-body__input--info,
                        .module-body__input--text {
                            padding: 0;
                        }
                        .module-body__list-content--outer {
                            display: table;
                            table-layout: fixed;
                            min-height: 50px;
                            width: 100%;
                        }
                        .module-body__list-content--inner {
                            display: table-cell;
                            vertical-align: middle;
                        }
                        .module-body__list--title,
                        .module-body__list--info,
                        .module-body__list--btn {
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            max-width: 100%;
                        }
                        .module-body__list--title {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            height: 24px;

                            span {
                                cursor: pointer;
                            }

                            &.module-body_linked {
                                color: #2a5885;
                            }
                        }
                        .module-body__list--info {
                            display: block;
                            padding-top: 5px;
                            box-sizing: border-box;
                            color: #656565;
                        }
                        .module-body__list--text {
                            padding-top: 9px;
                            word-wrap: break-word;
                        }
                        .module-body__list-button {
                            margin: 12px 0 2px;

                            text-transform: unset;
                            text-decoration: none;
                            border-radius: 4px;
                            border: 0;

                            background-color: #5181b8 !important;
                            color: #fff;

                            &.compact {
                                position: absolute;
                                right: 30px;
                                top: 0;
                            }

                            &:hover {
                                background-color: #5b88bd !important;
                            }
                        }
                        .module-body__list--info.address::before,
                        .module-body__list--info.time::before {
                            display: block;
                            content: '';

                            position: absolute;
                            margin: 2px 0 0 -24px;
                            height: 15px;
                            width: 15px;

                            background: url(/img/icons/group_info_cons.png) no-repeat 0 0;
                            background-position-x: 0;
                            background-position-y: 0;
                        }
                        .module-body__list--info.address::before {
                            background-position: 0 -60px;
                        }
                        .module-body__list--info.address,
                        .module-body__list--info.time {
                            padding-left: 24px;
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
                    .module-body__list-row {
                        & + .module-body__list-row {
                            border-top: 1px solid #424242;
                        }

                        .module-body__list-content {
                            .module-body__list--title,
                            .module-body__list--text {
                                color: #7a7a7a;
                            }
                        }
                    }
                }
                .load-more__btn,
                .module-body .add-item__btn {
                    background-color: #1e1e1e;
                    color: #7a7a7a;

                    &:hover {
                        background-color: #424242;
                    }
                }
                .load-more__btn {
                    border-top: 1px solid #424242;
                }
            }
        }
    }
    @media all and (max-width: 460px) {
        .widget-list {
            ::v-deep .v-card__text {
                .module-body .module-body__list-row {
                    .module-body__list-content {
                        .module-body__list-button.compact {
                            position: relative;
                            right: 0;
                            top: 0;
                        }
                    }
                }
            }
        }
    }
</style>
