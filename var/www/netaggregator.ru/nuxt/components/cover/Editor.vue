<template>
    <v-flex class="cover-editor">
        <v-card class="cover-editor__pane" tile flat>
            <v-card-text class="cover-editor__card">
                <div @click="view" class="cover-editor__list-item background">
                    <div class="cover-template--image-wrapper">
                        <noindex>
                            <v-img v-if="bg" :src="bg" class="cover-template--image" alt="background" />
                        </noindex>

                        <!--<v-img v-visible.once:300px="load"
                            class="cover-template--image"
                            lazy-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                            :data-src="`${bg}`"
                            alt="image"
                        />-->
                    </div>
                </div>

                <div class="cover-editor__list-item widgets mt-5">
                    <div class="list-item__field">
                        <v-combobox
                            :value="widgets"
                            :color="color"
                            :item-color="color"
                            :label="$t('cover.widgets')"
                            class="cover-combobox"
                            append-icon=""
                            ref="combobox"
                            hide-details
                            readonly
                            outlined
                            multiple
                        >
                            <template #selection="{ index, item }">
                                <v-chip class="v-chip--select-multi" :key="index" small>
                                    {{ item.name | cut }}
                                </v-chip>
                            </template>
                        </v-combobox>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    // import visible from '~/directives/visible'
    import { decode } from '~/utils/ubjson.mjs'
    import { mongoId } from '~/utils/cover'

    import summ from 'hash-sum'
    import axios from 'axios'

    export default {
        filters: {
            cut(text = '') {
                return text.length > 13 ? text.slice(0, 12) + '…' : text
            }
        },
        /* directives: {
            visible
        }, */
        computed: {
            reload: {
                set(reload) {
                    this.$store.commit('cover/set', { reload })
                },
                get() {
                    return this.$store.state.cover.reload
                }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            user() {
                return this.$store.state.app.user || {}
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            dialog(v) {
                this.$emit('change', v)
            },
            '$store.state.cover': {
                handler: 'update',
                deep: true
            }
        },
        data: () => ({
            bg: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            widgets: []
        }),
        methods: {
            view()
            {
                this.$bus.$emit('view', { frame: [{ url: this.bg }], idx: 0 })
            },
            async startEdit()
            {
                let { idx, list } = this.$store.state.cover,
                    item = (list[idx] || {}),
                    error,
                    edit,
                    data

                try {

                    ({ data } = await axios.get(
                        `/dcover/${item.uid}/${item._id}/struct.wxg?hash=${summ({ ...list[idx], hash: this.reload })}`,
                        { responseType: 'blob' })
                    )

                    /* ({ data } = await this.$axios.get('/cover/struct', {
                        params: { hash: item._id, uid: this.$store.state.app.user.id },
                        responseType: 'blob'
                    })) */

                    edit = decode(await data.arrayBuffer())

                } catch (e) {
                    error = e.message

                    try {

                        if (data && (edit = JSON.parse(await data.text()))) {
                            error = edit.error
                        }

                    } catch (e) {
                    }
                }

                if (error) {
                    return this.$bus.$emit('snack', { content: `Error: ${error}`, color: 'error', raw: true })
                }
                if (typeof edit === 'object') {
                    this.$store.commit('cover/set', { hash: item._id, name: item.name, connections: item.connections, edit })
                    await this.$router.push('/designer')
                    this.reload = mongoId()
                }
            },
            update()
            {
                let { idx, list } = this.$store.state.cover

                this.bg = '/dcover/default/cover.png'
                this.widgets = []

                try {

                    if (!list[idx]) return

                    this.widgets = (list[idx].widgets || []).map(k => ({ name: k.replace('widget-', '') }))

                    if (list[idx].background) {
                        this.bg = `/dcover/${list[idx].uid}/${list[idx]._id}/template.png&${
                            summ({ ...list[idx], hash: this.reload })
                        }`
                    }

                } catch (e) {
                }

                this.$emit('update')
            }
            /* load({ el })
            {
                const holder = el.querySelector('.v-image__placeholder'),
                    img = el.querySelector('.v-image__image')

                if (el.dataset && el.dataset.src) {
                    img.style.backgroundImage = `url(${el.dataset.src})`
                    img.style.backgroundPosition = 'center center'
                }

                img.classList.remove('v-image__image--preload')

                holder && holder.remove()
            } */
        },
        created()
        {
            this.update()
        }
    }
</script>

<style lang="scss" scoped>
    .cover-editor .cover-editor__pane {
        display: flex;
        height: 100%;

        flex-direction: column;
        justify-content: space-between;

        .cover-editor__card {
            padding: 8px;

            .cover-editor__list-item {
                user-select: none;
                font-size: 16px;

                &.background {
                    cursor: pointer;
                }
                .cover-template--image-wrapper {
                    position: relative;

                    .cover-template--image {
                        display: block;
                        height: 223px;
                        width: 100%;

                        background-position: 50%;
                        background-size: cover;
                        vertical-align: middle;
                    }
                }
                .list-item__field .cover-combobox {
                    ::v-deep .v-input__control > .v-input__slot {
                        fieldset {
                            border: 2px solid #8f8f8f;
                        }
                        .v-select__slot {
                            padding: 10px 0 0;
                        }
                    }
                    input[type="text"] {
                        pointer-events: none;
                    }
                    .v-chip__content {
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>
