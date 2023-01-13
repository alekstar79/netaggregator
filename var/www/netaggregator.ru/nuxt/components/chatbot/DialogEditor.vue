<template>
    <v-list class="dialogs-editor-list" :class="{ empty: !rootNode.length }" key="chatbot-dialog-editor">
        <template v-if="rootNode.length">
            <tree :value="rootNode" :ondragstart="cancel.bind(_self)" :ondragend="cancel.bind(_self)" :indent="15">
                <a v-on="{ [listener]: toggleFold.bind(_self, { node, path, tree }) }"
                   class="v-list-item v-list-item--link theme--light item-block"
                   slot-scope="{ node, index, path, tree }"
                   :tabindex="0"
                >
                    <div :class="{ drop_arrow: node.children && node.children.length, folded: node.$folded }" />

                    <v-list-item-title :class="{ [`${color}--text`]: !0, ['mr-2']: node.children && node.children.length }">
                        {{ node.keywords.join(', ') || '…' }}
                    </v-list-item-title>

                    <v-btn
                        v-on="{ [listener]: edit.bind(_self, { node }) }"
                        :color="color"
                        :tabindex="0"
                        aria-label="edit"
                        tag="a"
                        icon
                    >
                        <v-icon dense>mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn
                        v-on="{ [listener]: copy.bind(_self, { node, index, path, tree }) }"
                        :color="color"
                        :tabindex="0"
                        aria-label="copy"
                        tag="a"
                        icon
                    >
                        <v-icon dense>mdi-content-copy</v-icon>
                    </v-btn>

                    <v-btn
                        v-on="{ [listener]: remove.bind(_self, { node, path, tree }) }"
                        :color="color"
                        :tabindex="0"
                        aria-label="remove"
                        tag="a"
                        icon
                    >
                        <v-icon dense>mdi-trash-can-outline</v-icon>
                    </v-btn>
                </a>
            </tree>
        </template>
        <template v-else-if="user">
            <v-list-item :ripple="false">
                <v-list-item-title class="text-center disabled--text">
                    <p>{{ $t('chatbot.unconfigured') }}</p>
                    <p>{{ $t('chatbot.start-replica') }}</p>
                </v-list-item-title>
            </v-list-item>
        </template>
        <template v-else>
            <v-list-item :ripple="false">
                <v-list-item-title class="text-center disabled--text">
                    <p>{{ $t('common.needed') }}</p>
                </v-list-item-title>
            </v-list-item>
        </template>

        <v-list-item v-if="user" @click="addChild" :ripple="false">
            <v-list-item-title class="text-center">
                <v-icon :color="color">mdi-plus-circle-outline</v-icon>
            </v-list-item-title>
        </v-list-item>
    </v-list>
</template>

<script>
    export default {
        components: {
            /**
            * @package he-tree-vue@^1.2.1
            * @see https://github.com/phphe/he-tree-vue
            */
            tree: () => import(/* webpackChunkName: "he-tree" */ 'he-tree-vue')
                .then(({ Tree, Draggable, Fold }) => Tree.mixPlugins([Draggable, Fold]))
        },
        props: {
            fold: {
                required: true,
                type: Boolean
            }
        },
        computed: {
            listener() {
                return this.mobile ? 'touchend' : 'click'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            }
        },
        watch: {
            '$store.state.chatbot.reload': 'doReload',
            '$store.state.chatbot.list': 'doReload',

            fold: 'update'
        },
        data() {
            return {
                rootNode: this.getDialogs(),
                stopPropagation: false,
                dragStarted: false
            }
        },
        methods: {
            getDialogs()
            {
                const { list = [], idx = null } = this.$store.state.chatbot

                if (list.length && idx !== null) {
                    return JSON.parse(JSON.stringify((list[idx] || {}).dialogs || []))
                }

                return []
            },
            doReload()
            {
                this.rootNode = this.getDialogs()

                this.$emit('update')
            },
            addChild()
            {
                this.$store.commit('chatbot/createQuestion')
            },
            folding()
            {
                this.$store.commit('chatbot/folding', this)
            },
            toggleFold({ path })
            {
                if (!this.stopPropagation) {
                    this.$store.commit('chatbot/toggleFold', { path })
                }

                this.stopPropagation = false
            },
            edit({ node: { id } })
            {
                this.stopPropagation = true

                this.$nextTick().then(() => {
                    this.$store.commit('chatbot/set', { id })
                })

                return false
            },
            copy({ index, path })
            {
                this.stopPropagation = true

                index++

                this.$store.commit('chatbot/nodeCopy', { path, index })

                this.$emit('update')

                return false
            },
            remove({ node: { id } })
            {
                this.stopPropagation = true

                this.$store.commit('chatbot/nodeRemove', { id })

                return false
            },
            update()
            {
                this.folding()

                this.$emit('update')
            },
            cancel(tree, store)
            {
                this.mobile && store.startEvent.stopPropagation()

                if (this.dragStarted) {
                    this.$store.commit('chatbot/updateDialogs', this.rootNode)
                }

                this.dragStarted = !this.dragStarted
            }
        },
        beforeMount()
        {
            import(/* webpackChunkName: "he-tree" */ 'he-tree-vue/dist/he-tree-vue.css')
        },
        mounted()
        {
            this.update()
        }
    }
</script>

<style lang="scss" scoped>
    .dialogs-editor-list {
        ::v-deep .he-tree .tree-node-back {
            .tree-node {
                border: unset !important;
                padding: 0;

                .v-list-item {
                    padding: 0 5px 0 16px;
                }
                .v-btn {
                    cursor: pointer;

                    &:hover::before {
                        background-color: currentColor;
                    }
                    .v-icon {
                        font-size: 20px !important;
                    }
                }
                .item-block {
                    position: relative;

                    .drop_arrow {
                        position: absolute;
                        left: 4px;
                        height: 0;
                        width: 0;

                        border-color: #9c9d9e transparent;
                        border-width: 5px 5px 0 5px;
                        border-style: solid;

                        transition: transform .4s ease-out;
                        transform: rotate(-180deg);

                        &.folded {
                            transform: rotate(-90deg);
                        }
                    }
                }
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
                &:hover {
                    background-color: #303030;
                }
            }
        }
    }
</style>
