<template>
    <ul class="list-unstyled pricing-one__list">
        <li v-for="(item, i) in services" @click="toggle(item)" :key="i">
            <v-layout>
                <v-flex class="check">
                    <v-checkbox
                        v-if="type === 'custom_pack'"
                        v-model="stub"
                        :value="item"
                        :ripple="false"
                        color="mediumseagreen"
                        hide-details
                        dense
                    />
                    <v-icon
                        v-else-if="selected.includes(item)"
                        v-text="'mdi-check'"
                    />
                </v-flex>

                <v-flex class="service-name"
                    v-html="$t(`toolbar.${item}`)"
                />
            </v-layout>
        </li>
    </ul>
</template>

<script>
    export default {
        props: {
            type: {
                type: String,
                required: true
            },
            services: {
                type: Array,
                default: () => ['chatbot','stream','widget','cover','designer']
            },
            selected: {
                type: Array,
                required: true
            }
        },
        model: {
            prop: 'selected',
            event: 'choose'
        },
        computed: {
            stub: {
                get() {
                    return this.list
                },
                set() {
                    //
                }
            },
            list: {
                set(v) {
                    this.$emit('choose', v)
                },
                get() {
                    return this.selected
                }
            }
        },
        methods: {
            toggle(item)
            {
                if (this.type === 'custom_pack') {
                    this.list = [...new Set(this.list.includes(item) ? this.list.filter(_item => _item !== item) : [...this.list, item])]
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .pricing-one__list {
        &.list-unstyled {
            padding-left: unset;
            list-style: none;
        }
        li {
            cursor: pointer;

            & > .layout .check {
                ::v-deep .v-input {
                    padding-top: 0;
                    margin-top: 0;

                    .v-input__slot {
                        justify-content: flex-end;
                    }
                }
            }
        }
    }
</style>
