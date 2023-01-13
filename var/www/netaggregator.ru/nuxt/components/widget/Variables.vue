<template>
    <v-menu v-model="dialog.show" :position-x="dialog.x" :position-y="dialog.y" :z-index="dialog.z" absolute>
        <v-card class="variables-menu">
            <v-card-text class="variables-menu__pane">
                <v-layout class="vars-list" column>
                    <div class="vars-list__item" v-for="(item, i) in variables" @click="choose(item)" :key="`var-${i}-${item}`">
                        <p>{{ item | brackets }}</p>
                    </div>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script>
    const wrap = v => `{${v}}`

    export default {
        filters: {
            brackets(v) {
                return wrap(v)
            }
        },
        computed: {
            variables() {
                return this.$store.state.widget.variables
            },
            dialog() {
                return this.$store.state.widget.dialog
            }
        },
        watch: {
            dialog(v) {
                !v && this.close()
            }
        },
        methods: {
            close()
            {
                const { x, y } = this.dialog

                this.$store.commit('widget/set', {
                    dialog: {
                        handler: null,
                        show: false,
                        z: 0,
                        x,
                        y
                    }
                })
            },
            choose(v)
            {
                this.dialog.handler(wrap(v))

                this.close()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .variables-menu {
        .variables-menu__pane {
            font-size: 16px;
            padding: 11px 0;

            .vars-list {
                margin-top: unset;

                .vars-list__item {
                    padding: 3px 15px;
                    cursor: pointer;

                    > p {
                        font-size: unset !important;
                        font-weight: 400;
                        margin: 5px 0;
                    }
                    &:hover {
                        background: rgba(245,247,249,.9);
                    }
                }
            }
        }
        &.theme--dark .variables-menu__pane {
            .vars-list__item:hover {
                background: rgba(245,247,249,.1);
            }
        }
    }
</style>
