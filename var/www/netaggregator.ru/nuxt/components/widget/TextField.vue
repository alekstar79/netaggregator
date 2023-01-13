<template>
    <v-text-field
        v-model.trim="field"
        @click:append="append"
        @click.stop=""
        :class="classes"
        :label="label"
        :rules="rules"
        :color="paint"
        :error="error"
        :error-messages="errorMessages"
        :hide-details="hideDetails"
        append-icon="mdi-code-braces"
        ref="textfield"
        flat
    />
</template>

<script>
    export default {
        props: {
            value: {
                required: true,
                type: String
            },
            rules: {
                default: () => [() => true],
                type: Array
            },
            errorMessages: {
                type: String,
                default: ''
            },
            error: {
                type: Boolean,
                default: false
            },
            hideDetails: {
                type: Boolean,
                default: false
            },
            classList: {
                type: String,
                default: ''
            },
            label: {
                type: String,
                default: ''
            },
            color: {
                type: String,
                default: ''
            },
            zIndex: {
                type: Number,
                default: 0
            }
        },
        computed: {
            paint() {
                return this.color || this.$store.state.app.color
            },
            classes() {
                return 'widget__text-field' + this.classList
            },
            field: {
                set(v) {
                    this.$emit('input', v)
                },
                get() {
                    return this.value
                }
            }
        },
        methods: {
            append({ clientX, clientY })
            {
                const handler = this.insert,
                    x = clientX,
                    y = clientY,
                    z = 300

                this.$store.commit('widget/set', {
                    dialog: {
                        show: true,
                        handler,
                        x,
                        y,
                        z
                    }
                })
            },
            insert(variable)
            {
                if (!variable) return

                let input = this.$refs.textfield.$refs.input,
                    start = input.selectionStart,
                    end = input.selectionEnd,
                    tmp = input.value,
                    cursor = start

                this.field = tmp.substring(0, start) + variable + tmp.substring(end, tmp.length)

                cursor += variable.length
                input.selectionStart = input.selectionEnd = cursor

                this.$refs.textfield.focus()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .widget__text-field {
        ::v-deep .v-icon {
            font-size: 18px;
        }
        ::v-deep .v-input__append-inner {
            transition: .5s;
            opacity: 0;
        }
        &:hover ::v-deep .v-input__append-inner {
            opacity: 1;
        }
    }
</style>
