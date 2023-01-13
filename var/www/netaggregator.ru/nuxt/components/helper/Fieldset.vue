<template>
    <div class="custom" :class="classes" v-bind="$attrs" v-on="$listeners">
        <div class="v-input__control">
            <div class="v-input__slot">
                <fieldset :style="{ borderColor }">
                    <legend :style="{ width }">
                        <span />
                    </legend>
                </fieldset>

                <div class="v-select__slot">
                    <label v-if="label" :class="themeClasses" class="v-label v-label--active" ref="label">
                        <slot name="label" />
                    </label>

                    <div class="v-select__selections" :class="`${themeClasses} ${slotClasses}`">
                        <slot name="content" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            border: {
                type: String,
                default: ''
            },
            slotClasses: {
                type: String,
                default: ''
            },
            dense: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            borderColor() {
                return this.border || (
                    this.$vuetify.theme.dark ? 'rgba(255,255,255,.24)' : 'rgba(0,0,0,.38)'
                )
            },
            themeClasses() {
                return `theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`
            },
            classes() {
                return {
                    'v-input': true,
                    'v-input--hide-details': true,
                    'v-input--is-label-active': true,
                    'v-input--dense': this.dense,
                    'v-text-field': true,
                    'v-text-field--enclosed': true,
                    'v-text-field--outlined': true,
                    'v-select': true,
                    [this.themeClasses]: true
                }
            }
        },
        watch: {
            '$store.state.app.window': 'measure'
        },
        data: () => ({
            width: '32px',
            label: true
        }),
        methods: {
            measure()
            {
                let width = 0

                try {

                    width = this.$refs.label.clientWidth
                    /* width = parseInt(
                        window.getComputedStyle(/** @type HTMLElement *!/ this.$refs.label)
                            .getPropertyValue('width')
                            .replace(/\D+$/, '')
                    ) */

                    if (width > 155) {
                        width = 155
                    }

                } catch (e) {
                }

                this.label = width !== 0
                this.width = `${width}px`
            }
        },
        mounted()
        {
            this.$nextTick().then(this.measure)
        }
    }
</script>

<style lang="scss" scoped>
    .custom.v-input {
        .v-input__slot .v-select__slot {
            display: flex;
            align-items: center;
            // min-height: 42px;

            label {
                position: absolute;
                // left: 0; // 2px...15px (0)
                top: 12px;
            }
        }
        &.v-input--dense {
            .v-input__slot .v-select__slot {
                label {
                    top: 5px;
                }
            }
        }
    }
</style>
