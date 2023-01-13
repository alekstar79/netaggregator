<template>
    <v-layout class="header-tools" wrap>
        <v-tooltip :disabled="mobile" nudge-bottom="60">
            <template #activator="{ on }">
                <v-btn v-on="on" @click="openSaveDialog" class="widget-save" aria-label="save" icon>
                    <v-icon dense>mdi-content-save</v-icon>
                </v-btn>
            </template>
            <span>{{ $t('tooltip.save') }}</span>
        </v-tooltip>
        <v-tooltip :disabled="mobile" nudge-bottom="60">
            <template #activator="{ on }">
                <v-btn v-on="on" @click="clearWidget({ alter: human })" class="reset" aria-label="sync" icon>
                    <v-icon dense>mdi-sync</v-icon>
                </v-btn>
            </template>
            <span>{{ $t('tooltip.clear_widget') }}</span>
        </v-tooltip>

        <slot name="addon" />

        <v-tooltip :disabled="mobile" nudge-bottom="60">
            <template #activator="{ on }">
                <v-btn v-on="on" @click="toggleHuman" class="human" aria-label="gender" icon>
                    <v-icon v-text="'mdi-human-' + human" dense />
                </v-btn>
            </template>
            <span>{{ $t('tooltip.gender_indication') }}</span>
        </v-tooltip>
        <v-tooltip :disabled="mobile" nudge-bottom="60">
            <template #activator="{ on }">
                <v-btn v-on="on" @click="toggleLang" class="lang" aria-label="lang" icon>
                    <widget-ru-icon :off="!ru" :fill="ruFill" />
                </v-btn>
            </template>
            <span>{{ $t('tooltip.lang_indication') }}</span>
        </v-tooltip>
        <v-tooltip :disabled="mobile" nudge-bottom="60">
            <template #activator="{ on }">
                <v-btn v-on="on" @click="openHeaderTool" class="settings" aria-label="settings" icon>
                    <v-icon dense>mdi-cog</v-icon>
                </v-btn>
            </template>
            <span>{{ $t('tooltip.settings') }}</span>
        </v-tooltip>

        <v-dialog v-model="saveDialog" max-width="320px">
            <v-card class="widget-save__dialog">
                <v-card-text class="dialog-pane">
                    <v-text-field label="Имя"
                        v-model="appellation"
                        :hide-details="!long"
                        :rules="[rule]"
                        :color="color"
                        :error="long"
                    />
                </v-card-text>

                <v-card-actions class="justify-center">
                    <v-btn @click="apply" :color="color" aria-label="save" text>
                        {{ $t('common.save') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <lazy-widget-tool-dialog v-model="toolDialog" :set="set" @update="closeHeaderTool" />
    </v-layout>
</template>

<script>
    import { common, storage, error } from '~/mixins/widget'

    const readers = { icon: 'mdi-filter-outline', module: 'Readers', cmp: 'widget-readers' }

    export default {
        mixins: [common, storage, error],

        props: {
            tools: {
                default: () => [],
                type: Array
            }
        },
        computed: {
            ruFill() {
                return this.$vuetify.theme.dark ? '#7a7a7a' : '#fff'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            human() {
                return this.male ? 'male' : 'female'
            }
        },
        data: () => ({
            appellation: '',

            saveDialog: false,
            toolDialog: false,
            long: false,
            male: true,
            ru: true,

            set: {
                tools: []
            }
        }),
        methods: {
            rule(v)
            {
                return ((this.long = v.length > 50)) ? this.$t('widget.more_50') : true
            },
            toggleHuman()
            {
                this.male = !this.male
                this.$emit('toggle', this.human)
            },
            toggleLang()
            {
                this.ru = !this.ru
                this.$emit('toggle', this.ru ? this.human : 'lang')
            },
            openHeaderTool()
            {
                this.set = { tools: [...this.tools, readers] }
                this.saveDialog = false
                this.toolDialog = true
            },
            closeHeaderTool()
            {
                this.toolDialog = false
                this.set = { tools: [] }
            },
            openSaveDialog()
            {
                this.appellation = this.data.appellation || ''
                this.toolDialog = false
                this.saveDialog = true
            },
            apply()
            {
                if (!this.long) {
                    this.saveDialog = false
                    this.save()
                }
            }
        },
        mounted()
        {
            this.$emit('update')
        }
    }
</script>

<style lang="scss" scoped>
    .header-tools {
        ::v-deep .v-btn.v-btn--icon {
            height: 36px;
            width: 36px;
            margin: 0;
            color: #fff;

            &:hover::before {
                background-color: currentColor;
                opacity: .3;
            }
            .v-icon {
                font-size: 20px;
            }
        }
    }
    .widget-save__dialog {
        .v-card__text::v-deep.dialog-pane {
            padding: 15px;
        }
        .v-card__actions::v-deep {
            padding: 0 0 10px;
        }
    }
</style>
