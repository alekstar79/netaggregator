<template>
    <v-layout justify-center>
        <material-card class="module widget-text" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 1 }" class="widget-header__title pa-3">
                        {{ $t('widget.text') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools @toggle="assignEntity" v-on="$listeners" />
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header v-model="value" v-on="$listeners" />

            <v-layout class="module-body" column>
                <lazy-widget-text-field
                    v-if="text"
                    v-model="value.text"
                    v-click-outside="clickOutside.bind(_self, 'text')"
                    class="module-body__input--content"
                    :rules="[v => v && v.length > 200 ? $t('widget.more_200') : true]"
                />
                <v-flex v-else
                    v-text="value.text || $t('widget.upto_200')"
                    @click.stop="text = true"
                    class="module-body__text--content"
                />
                <lazy-widget-text-field
                    v-if="descr"
                    v-model="value.descr"
                    v-click-outside="clickOutside.bind(_self, 'descr')"
                    class="module-body__input--descr"
                    :rules="[v => v && v.length > 200 ? $t('widget.more_200') : true]"
                    hide-details
                />
                <v-flex v-else
                    v-text="value.descr || $t('widget.descr_200')"
                    @click.stop="descr = true"
                    class="module-body__text--descr"
                />
            </v-layout>

            <div @click="openDialog(value, { name: 'more', link: 'more_url', ln: 100, both: true })"
                class="flat_btn load-more__btn"
            >
                <span class="load-more__btn--label">
                    {{ value.more || $t('widget.footer') }}
                </span>
            </div>
        </material-card>

        <lazy-widget-link-dialog v-model="link" :set="set" @update="handler" />
    </v-layout>
</template>

<script>
    import { extendComputed } from '~/utils/widget'
    import { common, error } from '~/mixins/widget'

    export default {
        mixins: [error, common],

        computed: {
            ...extendComputed('text'),

            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'clear',

            text() {
                this.$emit('update')
            },
            descr() {
                this.$emit('update')
            }
        },
        data: () => ({
            handler: () => {},
            human: 'male',

            descr: false,
            text: false,
            link: false,

            set: {}
        }),
        methods: {
            clickOutside(field)
            {
                this[field] && (this[field] = false)
            },
            openDialog(value, { name, link, ln = 100, both = false })
            {
                this.set = { name: value[name], link: value[link], ln, both }

                this.handler = set => {
                    this.link = false

                    if (set.close) return

                    set && (value[name] = set.name)
                    set && (value[link] = set.link)
                }

                this.link = true
            },
            assignEntity(entity)
            {
                this.human = entity
            },
            clear()
            {
                this.descr = false
                this.text = false
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
    .widget-text {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 12px 15px 15px;

                .module-body__input--content,
                .module-body__text--content {
                    line-height: 26px;
                    font-weight: 400;
                    font-size: 19px;

                    -webkit-font-smoothing: subpixel-antialiased;
                              -moz-osx-font-smoothing: grayscale;
                }
                .module-body__input--descr,
                .module-body__text--descr {
                    margin: 0 0 10px;
                    line-height: 20px;
                }
                .module-body__text--content,
                .module-body__text--descr {
                    word-wrap: break-word;
                    text-align: center;
                }
                .module-body__input--content,
                .module-body__input--descr {
                    padding: 0;
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
                .load-more__btn {
                    border-top: 1px solid #424242;
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
