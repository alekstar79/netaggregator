<template>
    <v-card class="tariff-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="tariff-dialog__btn-wrapper" justify-start>
                <v-btn @click="$emit('close')" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs class="tariff-dialog__tabs-header" :color="color" height="60px" hide-slider grow>
                <v-tab @click="$emit('close')" :ripple="false">
                    PAYMENT
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="tariff-dialog__card-pane">
            <v-layout class="pane">
                <p>{{ $t(`payment.${entity}_offer_to_pay`) }}</p>

                <v-btn class="shadowless" @click="toTariff" :color="color" aria-label="disable-promo-btn">
                    {{ $t('common.transition') }}
                </v-btn>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        props: {
            entity: {
                type: String,
                required: true
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
        methods: {
            toTariff()
            {
                this.$store.commit('app/set', { goto: 4000 })
                this.$router.push('/')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .tariff-dialog__card {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .tariff-dialog__card-pane {
                max-height: calc(100vh - 86px);

                .layout.pane {
                    font-size: 5vmin;
                }
            }
        }
        .tariff-dialog__btn-wrapper {
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
        .tariff-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .tariff-dialog__card-pane {
            display: grid;
            place-content: center;
            padding: 15px !important;
            min-height: 360px;

            .layout.pane {
                flex-direction: column;
                align-items: center;

                margin: -40px 0 0;
                line-height: 1.42;
                font-size: 2vmin;

                text-align: center;
            }
        }
        &.theme--dark {
            .tariff-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
</style>
