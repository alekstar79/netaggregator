<template>
    <v-list class="dialogs-list" :class="{ empty: !list.length }" key="chatbot-dialogs-list">
        <template v-if="list.length">
            <v-list-item v-for="(item, i) in list"
                v-click-outside="clickOutside.bind(_self, i)"
                @click="stub[i].rename = true"
                :key="item._id"
                :ripple="false"
            >
                <v-text-field v-if="stub[i].rename" v-model.trim="item.name" :color="color" />
                <v-list-item-title v-else v-text="item.name" :class="`${color}--text`" />

                <v-btn @click="edit(i)" :color="color" aria-label="edit" icon>
                    <v-icon dense>mdi-pencil</v-icon>
                </v-btn>

                <v-btn @click="copy(item, i)" :color="color" aria-label="copy" icon>
                    <v-icon dense>mdi-content-copy</v-icon>
                </v-btn>

                <v-btn @click="remove(i)" :color="color" aria-label="remove" icon>
                    <v-icon dense>mdi-trash-can-outline</v-icon>
                </v-btn>
            </v-list-item>
        </template>
        <template v-else>
            <v-list-item :ripple="false">
                <v-list-item-title class="disabled--text text-center">
                    {{ $t('chatbot.new-dialogue') }}
                </v-list-item-title>
            </v-list-item>
        </template>

        <v-list-item @click="create" :ripple="false">
            <v-list-item-title class="disabled--text text-center pointer">
                <v-icon :color="color">mdi-plus-circle-outline</v-icon>
            </v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
    import { mongoId, setname, reassign } from '~/utils/chatbot'
    import cloneDeep from 'lodash/cloneDeep'

    export default {
        computed: {
            list: {
                set(list) {
                    this.$store.commit('chatbot/set', { list })
                },
                get() {
                    return this.$store.state.chatbot.list
                }
            },
            idx: {
                set(idx) {
                    this.$store.commit('chatbot/set', { idx })
                },
                get() {
                    return this.$store.state.chatbot.idx
                }
            },
            locale() {
                return this.$store.state.app.locale
            },
            color() {
                return this.$store.state.app.color
            }
        },
        data: () => ({
            stub: []
        }),
        watch: {
            list: 'clear'
        },
        methods: {
            clickOutside(i)
            {
                try {

                    this.stub[i].rename = false

                } catch (e) {
                }
            },
            create()
            {
                this.$store.commit('chatbot/createDialog', { name: +new Date() })

                setTimeout(() => {
                    this.stub[this.stub.length - 1].rename = true
                }, 100)
            },
            edit(i)
            {
                this.idx = i
            },
            copy(item, idx)
            {
                const $new = cloneDeep(item)

                $new._id = mongoId()
                $new.name = setname($new.name, this.locale)
                $new.dialogs = reassign($new.dialogs)

                this.list.splice(idx + 1, 0, $new)
            },
            remove(idx)
            {
                const list = this.list.slice()

                list.splice(idx, 1)

                this.list = list
            },
            clear()
            {
                this.stub = Array.from(this.list, () => ({ rename: false }))
            }
        },
        created()
        {
            this.clear()
        }
    }
</script>

<style lang="scss" scoped>
    .dialogs-list {
        ::v-deep .v-btn.v-btn--icon {
            cursor: pointer;

            &:hover::before {
                background-color: currentColor;
                opacity: .2;
            }
            .v-icon {
                font-size: 20px !important;
            }
        }
        ::v-deep .v-list-item {
            .v-list-item__title.pointer {
                cursor: pointer !important;
            }
        }
        &.theme--dark {
            ::v-deep .v-list-item {
                .v-list-item__title {
                    color: #7a7a7a !important;
                }
                .v-btn.v-btn--icon {
                    color: #7a7a7a !important;
                }
            }
        }
    }
</style>
