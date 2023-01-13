<template>
    <v-card class="openurl-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <helper-keypress :multiple-keys="multiple" @success="handler" />

        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="openurl-dialog__btn-wrapper" justify-start>
                <v-btn @click="close" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
                <v-btn @click="open" icon>
                    <v-icon>mdi-check</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs :color="color" class="openurl-dialog__tabs-header" height="60px" hide-slider show-arrows grow>
                <v-tab @click="close" :ripple="false">
                    <v-icon :color="color">
                        mdi-window-close
                    </v-icon>
                </v-tab>
                <v-tab @click="open" :ripple="false">
                    <v-icon :color="color">
                        mdi-check
                    </v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="openurl-dialog__card-pane">
            <v-layout class="pane">
                <v-text-field label="URL" v-model="url" :color="color" hide-details outlined />
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    const preventDefault = true, modifiers = []

    export default {
        props: {
            flag: {
                type: Boolean,
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
        data: () => ({
            url: null,

            multiple: [
                { /* Enter  */ keyCode: 13, preventDefault, modifiers },
                { /* Escape */ keyCode: 27, preventDefault, modifiers }
            ]
        }),
        methods: {
            handler({ event })
            {
                if (!this.flag) return

                switch (event.key) {
                    case 'Enter':
                        this.open()
                        break
                    case 'Escape':
                        this.close()
                        break
                }
            },
            open()
            {
                this.$emit('open', { src: this.url })

                this.close()
            },
            close()
            {
                this.$emit('close')

                this.url = null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .openurl-dialog__card {
        .openurl-dialog__btn-wrapper {
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
        .openurl-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .openurl-dialog__card-pane {
            padding: 15px !important;
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .openurl-dialog__card-pane {
                max-height: calc(100vh - 61px);
            }
        }
        &.theme--dark {
            .openurl-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
    @media all and (max-width: 320px) {
        ::v-deep .openurl-dialog__card-pane {
            height: calc(100vh - 61px);
        }
    }
</style>
