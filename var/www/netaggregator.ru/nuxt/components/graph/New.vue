<template>
    <v-menu v-model="menu"
        :position-x="window.width - 260"
        :position-y="(window.height - 390) / 2"
        :close-on-content-click="false"
        transition="slide-x-transition"
        max-height="390px"
        min-width="260px"
        max-width="260px"
        absolute
        offset-x
    >
        <v-card class="create-new__dialog">
            <v-card-text class="create-new__dialog-pane">
                <v-layout column>
                    <div class="text-uppercase sidebar-filter">
                        {{ $t('graph.resolution') }}
                    </div>

                    <v-radio-group v-model="dim" :mandatory="false" hide-details>
                        <v-list-item v-for="d in dimensions" @click.stop="" :ripple="false" :key="d.key">
                            <v-radio :ripple="false" :color="color" :value="d">
                                <template #label>
                                    <v-layout justify-space-between>
                                        <v-flex>{{ d.key }}</v-flex>

                                        <v-flex v-if="d.key !== 'Custom'" class="text-sm-right">
                                            {{ d.width }} : {{ d.height }}
                                        </v-flex>
                                    </v-layout>
                                </template>
                            </v-radio>
                        </v-list-item>
                    </v-radio-group>

                    <v-btn @click="create(dim)" class="shadowless white--text" :color="color" block>
                        {{ $t('common.build') }}
                    </v-btn>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script>
    import dimensions from '~/assets/data/canvas-dimensions'

    export default {
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            window() {
                return this.$store.state.app.window
            }
        },
        data: () => ({
            menu: false,
            dim: dimensions[3],
            dimensions
        }),
        methods: {
            openDialog()
            {
                setTimeout(() => this.menu = true)
            },
            create(value)
            {
                this.$emit(value.key === 'Custom' ? 'custom' : 'choose', value)

                this.menu = false
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('open:new-dialog', this.openDialog)
        },
        beforeMount()
        {
            this.$bus.$on('open:new-dialog', this.openDialog)
        }
    }
</script>

<style lang="scss" scoped>
    .create-new__dialog-pane {
        padding: 12px;

        .v-input--selection-controls {
            margin-top: 5px;
        }
        .v-input--radio-group {
            .v-list-item {
                display: block;
                min-height: 32px;
                padding: 5px;
            }
        }
        ::v-deep .v-btn {
            margin: 15px 0 0;
        }
        .sidebar-filter {
            padding: 5px;
        }
    }
</style>
