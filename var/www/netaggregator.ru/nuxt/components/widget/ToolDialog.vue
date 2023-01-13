<template>
    <v-dialog v-model="proxy" :width="mobile ? '100%' : '540px'" :fullscreen="mobile" :hide-overlay="mobile">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" :color="barColor" />

        <div class="tool-panel" :class="{ fullscreen: mobile, [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true }">
            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout v-if="preview" class="tools-dialog__btn-wrapper" justify-start>
                    <v-btn @click="preview = false" icon>
                        <v-icon>mdi-keyboard-backspace</v-icon>
                    </v-btn>
                </v-layout>
                <v-layout v-else class="tools-dialog__btn-wrapper" justify-start>
                    <v-btn @click="close()" icon>
                        <v-icon>mdi-window-close</v-icon>
                    </v-btn>
                    <template v-for="(t, i) in tools">
                        <v-btn @click="chooseTool(i)" :key="`mobile-tools-${t.icon}-${i}`" icon>
                            <v-icon>{{ t.icon }}</v-icon>
                        </v-btn>
                    </template>
                </v-layout>
            </template>
            <template v-else>
                <v-tabs v-if="preview" class="tools-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab @click="preview = false" :ripple="false">
                        <v-icon :color="color">mdi-keyboard-backspace</v-icon>
                    </v-tab>
                </v-tabs>
                <v-tabs v-else class="tools-dialog__tabs-header" :color="color" height="60px" hide-slider show-arrows grow>
                    <v-tab v-if="mobile" @click="close()" :ripple="false">
                        <v-icon :color="color">mdi-window-close</v-icon>
                    </v-tab>
                    <template v-for="(t, i) in tools">
                        <v-tab @click="chooseTool(i)" :key="`desktop-tools-${t.icon}-${i}`" :ripple="false">
                            <v-icon :color="color">{{ t.icon }}</v-icon>
                        </v-tab>
                    </template>
                </v-tabs>
            </template>

            <div class="tools-dialog__body py-4" :class="padding">
                <component :is="current" v-model="preview" :fullscreen="mobile" />
            </div>
        </div>
    </v-dialog>
</template>

<script>
    import { clone } from '~/utils/widget'

    export default {
        props: ['set', 'value'],

        model: {
            event: 'input',
            prop: 'value'
        },
        data() {
            return {
                proxy: this.value,
                preview: false,
                current: null,
                tools: []
            }
        },
        computed: {
            padding() {
                const condition = 'p2' in this.set || this.current === 'widget-readers'

                return { [condition ? 'px-2' : 'px-5']: true }
            },
            barColor() {
                return this.$vuetify.theme.dark ? '#1e1e1e' : '#f5f5f5'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            value: 'start',

            proxy(v) {
                this.$emit('input', v)
            }
        },
        methods: {
            chooseTool(idx)
            {
                this.tools[idx] && (this.current = this.tools[idx].cmp)
            },
            close(apply = false)
            {
                this.$emit('update', apply ? { success: true } : null)

                this.proxy = false
                this.tools = []
            },
            start(v)
            {
                this.preview = false

                if (!v || !this.set.tools.length) {
                    this.$emit('input', false)
                    return false
                }

                this.tools = clone(this.set.tools)
                this.chooseTool(this.set.tab || 0)

                this.proxy = v

                return true
            }
        },
        created()
        {
            this.start(this.value)
        }
    }
</script>

<style lang="scss" scoped>
    .tool-panel {
        background-color: #fff;

        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .tools-dialog__body.scroller {
                max-height: calc(100vh - 86px);
            }
        }
        .tools-dialog__btn-wrapper {
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
        .tools-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            &.theme--dark {
                border-bottom: 1px solid #424242;
            }
            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .tools-dialog__body {
            position: relative;
            min-height: 345px;
        }
        &.theme--dark {
            background-color: #1e1e1e;
        }
    }
</style>
