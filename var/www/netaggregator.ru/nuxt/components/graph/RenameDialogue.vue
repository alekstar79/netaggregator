<template>
    <v-card class="rename-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="rename-dialog__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
                <v-btn @click="$emit('apply', { name: value })" icon>
                    <v-icon>mdi-check</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs class="rename-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                <v-tab @click="$emit('close')" :ripple="false">
                    <v-icon :color="color">mdi-window-close</v-icon>
                </v-tab>
                <v-tab @click="$emit('apply', { name: value })" :ripple="false">
                    <v-icon :color="color">mdi-check</v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="rename-dialog__card-pane">
            <v-layout class="pane">
                <v-text-field label="Name" v-model="value" :color="color" hide-details outlined />
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        props: {
            name: {
                type: String,
                default: ''
            }
        },
        watch: {
            name(v) {
                this.value = v
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        data: () => ({
            value: ''
        }),
        mounted()
        {
            this.value = this.name
        }
    }
</script>

<style lang="scss" scoped>
    .rename-dialog__card {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .rename-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        .rename-dialog__btn-wrapper {
            max-height: 60px;
            padding: 0 10px;

            ::v-deep .v-btn {
                cursor: pointer;
                margin: 0 5px;

                &:hover::before {
                    background-color: currentColor;
                }
            }
        }
        .rename-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .rename-dialog__card-pane {
            padding: 15px !important;
        }
        &.theme--dark {
            .rename-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
</style>
