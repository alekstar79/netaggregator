<template>
    <v-card class="widget__main-settings" elevation="0">
        <v-card-text v-if="preview" class="preview-transition__pane">
            <v-layout column justify-space-between align-center>
                <v-avatar class="group-logo" size="72">
                    <img :src="group.photo_100 || group.photo_50" alt="">
                </v-avatar>

                <h2 class="preview-transition__container--heading">
                    {{ group.name }}
                </h2>

                <p class="preview-transition__container--text">
                    {{ $t('widget.preview_on_vk') }}
                </p>
            </v-layout>
        </v-card-text>
        <v-card-text v-else class="main-settings__panel">
            <div class="groups-chooser">
                <div v-if="!user && !vkapp">
                    <lazy-helper-fieldset>
                        <template #label>
                            {{ $t('widget.group') }}
                        </template>
                        <template #content>
                            {{ $t('common.needed') }}
                        </template>
                    </lazy-helper-fieldset>
                </div>
                <div v-else-if="!groups.length">
                    <lazy-helper-fieldset>
                        <template #label>
                            {{ $t('widget.group') }}
                        </template>
                        <template #content>
                            {{ $t('common.not_managed') }}
                        </template>
                    </lazy-helper-fieldset>
                </div>
                <div v-else-if="!vkapp || !vkapp.vk_group_id">
                    <v-select :value="group_id"
                        :menu-props="{ contentClass: 'scroller widget-settings-menu' }"
                        :label="$t('widget.group')"
                        :items="groups"
                        :item-color="color"
                        :color="color"
                        ref="select"
                        hide-details
                        outlined
                    >
                        <template #item="{ item }">
                            <v-list-item @click="chooseGroup(item)"
                                :aria-selected="item.value === group_id"
                                :class="{
                                    'accent--text': item.value === group_id,
                                    'v-list-item--active': item.value === group_id,
                                    'v-list-item--highlighted': item.value === group_id
                                }"
                            >
                                <v-badge offset-y="13" :color="item.paid.widget ? 'success' : 'error'" left dot>
                                    <v-list-item-title>
                                        {{ item.text | spoof(_self) }}
                                    </v-list-item-title>
                                </v-badge>
                            </v-list-item>
                        </template>
                    </v-select>
                </div>
            </div>

            <div class="widget-chooser mt-5">
                <v-select v-model="entity"
                    item-value="entity"
                    :menu-props="{ contentClass: 'scroller' }"
                    :label="$t('widget.widget')"
                    :items="modules"
                    :item-color="color"
                    :color="color"
                    hide-details
                    outlined
                >
                    <template #selection="{ item }">
                        {{ $t(`widget.${item.text}`) }}
                    </template>
                    <template #item="{ item }">
                        {{ $t(`widget.${item.text}`) }}
                    </template>
                </v-select>
            </div>
        </v-card-text>

        <v-card-actions class="justify-center" :class="{ mobile }">
            <template v-for="(btn, i) in controls">
                <v-btn class="shadowless"
                    @click="_self[btn.handler]()"
                    :key="`settings-${btn.action}-${i}`"
                    :block="mobile || btn.block"
                    :disabled="btn.disabled"
                    :ripple="false"
                    :color="color"
                >
                    {{ $t(`widget.${btn.action}`) }}
                </v-btn>
            </template>
        </v-card-actions>

        <v-dialog v-model="tariff" :width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-core-paid-dialogue entity="widget" @close="tariff = false" />
        </v-dialog>
    </v-card>
</template>

<script>
    import { common, code, error as emixin } from '~/mixins/widget'
    import { community } from '~/mixins/common'

    import { spoof } from '~/utils/common/spoof.mjs'

    export default {
        mixins: [emixin, common, community, code],

        filters: {
            spoof
        },
        props: {
            preview: {
                type: Boolean,
                required: true
            }
        },
        model: {
            event: 'toggle:app',
            prop: 'preview'
        },
        computed: {
            controls() {
                return this.preview
                    ? [{ action: 'transition', handler: 'transition', disabled: false, block: true }]
                    : [
                        { action: 'preview', handler: 'showWidgetPreviewBox', disabled: !this.vkapp && !this.user },
                        { action: 'update',  handler: 'update', disabled: !this.vkapp && !this.user },
                        { action: 'remove',  handler: 'remove', disabled: !this.vkapp && !this.user }
                      ]
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        methods: {
            chooseGroup(item)
            {
                this.$refs.select.isMenuActive = false

                this.group_id = item.value
            },
            async transition()
            {
                const { entity, data, group_id, user } = this

                await this.$ls.set('doit', {
                    route: 'widget',
                    action: 'previewAfterTransition',
                    params: { group_id, data },
                    entity
                })

                window.location.assign(process.env.APP_URI + '_' + user.id)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .widget__main-settings {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        min-height: 310px;
        height: 100%;

        h2, p, ul {
            min-width: fit-content;
            max-width: 300px;

            text-align: center;
            word-wrap: normal;
            line-height: 1.4;

            -webkit-font-smoothing: subpixel-antialiased;
                           -moz-osx-font-smoothing: auto;
        }
        h2 {
            margin-bottom: 10px;
            font-weight: 500;
            font-size: 20px;
        }
        p, ul {
            margin-top: 0;
            font-size: 16px;
            font-weight: 400;
            color: #656565;
        }
        .group-logo {
            border-radius: 50%;
            margin: 0 0 10px;
        }
        .preview-transition__cross--btn {
            position: absolute;
            right: 20px;
            top: 20px;

            height: 25px;
            width: 25px;
            margin: 0;

            cursor: pointer;
            color: #828a99;

            &:hover::before {
                background-color: currentColor;
            }
        }
        .preview-transition__pane {
            padding: 15px 15px 10px;

            &.fullscreen {
                padding: calc(100% / 3) 5px !important;
            }
        }
        .main-settings__panel {
            box-sizing: border-box;
            height: 190px;
            padding: 0;

            ::v-deep .v-input.v-text-field {
                color: #7a7a7a;

                .v-select__selections {
                    color: #7a7a7a;
                }
                fieldset {
                    border: 2px solid;
                }
            }
        }
        ::v-deep .v-card__actions {
            padding: 0;

            .v-btn {
                width: 100%;
                flex: 1 auto;
            }
            &.mobile {
                flex-direction: column;

                .v-btn {
                    margin: 5px;
                }
            }
        }
        &.theme--dark {
            ::v-deep .v-card__actions {
                .v-btn .v-btn__content {
                    color: #7a7a7a;
                }
            }
        }
    }
    .widget-settings-menu {
        .v-badge .v-list-item__title {
            margin-left: 10px
        }
    }
</style>
