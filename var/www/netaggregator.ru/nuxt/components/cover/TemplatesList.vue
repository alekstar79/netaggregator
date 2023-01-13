<template>
    <v-layout class="templates-list" :key="reload" column>
        <v-flex v-for="(t, i) in templates"
            class="cover-template--row"
            :class="{ last: designer && templates.length - 1 === i }"
            :key="i"
        >
            <div class="cover-template--image-wrapper" @click="view(i)">
                <v-img v-visible.once:300px="load.bind(_self)"
                    lazy-src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    :data-src="`/dcover/default/thumb/${t.hash}.png&${t.imghash}`"
                    class="cover-template--image"
                    alt="template-image"
                />

                <div class="cover-template--overlay">
                    1590x530
                </div>
            </div>

            <v-layout class="cover-template--controls">
                <v-btn class="cover-template--button shadowless"
                    @click="_self[t.action](t.hash)"
                    aria-label="action"
                    :key="t.key"
                    small
                >
                    <span>{{ $t(`common.${t.action}`) }}</span>

                    <v-menu v-if="!designer" v-model="t.state" close-on-content-click>
                        <template #activator="{ on }">
                            <v-btn v-on="on" color="#0f9d58" v-ripple="false" aria-label="toggle" icon>
                                <v-icon color="#fff">mdi-chevron-down</v-icon>
                            </v-btn>
                        </template>

                        <v-list>
                            <v-list-item v-for="item in actions" @click.stop="t.action = item" :key="item">
                                <v-list-item-title>{{ $t(`common.${item}`) }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-btn>
            </v-layout>
        </v-flex>

        <v-dialog v-model="dialog" content-class="tags-dialog" :max-width="mobile ? '100%' : '600px'" :fullscreen="mobile">
            <v-card class="tags-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <v-layout class="tags-dialog__btn-wrapper" justify-start>
                        <v-btn @click="dialog = false" icon>
                            <v-icon>mdi-window-close</v-icon>
                        </v-btn>
                        <v-btn @click="setTags" icon>
                            <v-icon>mdi-check</v-icon>
                        </v-btn>
                    </v-layout>
                </template>
                <template v-else>
                    <v-tabs :color="color" class="tags-dialog__tabs-header" height="60px" hide-slider grow>
                        <v-tab @click="dialog = false" :ripple="false">
                            <v-icon :color="color">
                                mdi-window-close
                            </v-icon>
                        </v-tab>
                        <v-tab @click="setTags" :ripple="false">
                            <v-icon :color="color">
                                mdi-check
                            </v-icon>
                        </v-tab>
                    </v-tabs>
                </template>

                <v-card-text class="tags-dialog__card-pane">
                    <v-layout class="pane">
                        <v-flex class="fieldset">
                            <div class="legend">{{ $t('common.tags') }}</div>

                            <v-combobox @change="updateMarks"
                                :label="$t('stream.add_tags')"
                                :value="marks"
                                append-icon=""
                                counter="5"
                                hide-details
                                multiple
                                flat
                                solo
                            >
                                <template #selection="{ attrs, item, index, parent, selected, disabled }">
                                    <v-chip v-bind="attrs"
                                        :key="index"
                                        :disabled="disabled"
                                        :input-value="selected"
                                        @dblclick.stop="editMarks({ item, index, parent })"
                                        @click.stop="select({ item, parent })"
                                        @click:close="removeMarks({ index })"
                                        class="v-chip--select-multi"
                                        close
                                        small
                                    >
                                        {{ item }}
                                    </v-chip>
                                </template>
                            </v-combobox>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { each } from '~/utils/async-array.mjs'
    import { decode } from '~/utils/ubjson.mjs'

    import visible from '~/directives/visible'
    import axios from 'axios'

    function revoke() {}

    export default {
        directives: { visible },

        props: {
            designer: {
                type: Boolean,
                default: false
            },
            filter: {
                type: Object,
                default: () => ({
                    value: 'all'
                })
            },
            order: {
                type: String,
                default: 'asc'
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            fullscreen() {
                return this.mobile || this.$store.state.app.vkapp
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            owner() {
                return this.$store.state.app.owner
            },
            actions() {
                const actions = this.designer ? ['edit'] : ['choose','edit']

                if (this.owner) {
                    actions.push('tags')
                }

                return actions
            },
            templates: {
                set(templates) {
                    this.$store.commit('cover/set', { templates })
                },
                get() {
                    return this.adduction(
                        this.$store.state.cover.templates,
                        this.filter.value,
                        this.order
                    )
                }
            }
        },
        watch: {
            '$store.state.cover.entity': 'preload',

            marks(array) {
                if (array.length > 5) {
                    this.marks = array.slice(0, 5)
                }
            },
            order() {
                this.reload = !this.reload
                this.$forceUpdate()
            },
            filter() {
                this.reload = !this.reload
                this.$forceUpdate()
            }
        },
        data: () => ({
            reload: false,
            dialog: false,
            hash: null,
            marks: [],

            revoke
        }),
        methods: {
            adduction(source, filter, order)
            {
                return source
                    .filter(c => filter !== 'all' ? (c.tags || []).includes(filter) : true)
                    .sort((a, b) => {
                        let k = 0

                        if (a._id === b._id) return k

                        if (order === 'desc') {
                            k = a._id < b._id ? 1 : -1
                        } else {
                            k = a._id > b._id ? 1 : -1
                        }

                        return k
                    })
                    .map(({ _id: hash, imghash, tags = [] }) => {
                        let tpl = { state: false, imghash, key: rndstring(), tags, hash },
                            action = this.designer ? 'edit' : 'choose',
                            update = () => this.$forceUpdate()

                        Object.defineProperty(tpl, 'action', {
                            enumerable: true,

                            get: () => action,
                            set: v => {
                                action = v
                                tpl.key = rndstring()
                                tpl.state = false
                                update()
                            }
                        })

                        return tpl
                    })
            },
            updateMarks(marks)
            {
                this.marks = marks.filter(Boolean)
            },
            removeMarks({ index })
            {
                this.marks.splice(index, 1)
            },
            select({ index, parent })
            {
                parent.selectedIndex = index
            },
            editMarks({ item, index, parent })
            {
                parent.internalSearch = item
                parent.editingIndex = index
                parent.selectedIndex = -1
            },
            preCache(idx)
            {
                const load = src => this.$store.dispatch('cover/cacheImage', { src }),
                    { hash, imghash } = this.templates[idx]

                return Promise.all([
                    `/dcover/default/template/${hash}.png&${imghash}`,
                    `/dcover/default/thumb/${hash}.png&${imghash}`

                ].map(load))
            },
            async view(idx)
            {
                await this.preCache(idx)

                this.$bus.$emit('view', {
                    frame: this.templates.map(t => ({
                        url: `/dcover/default/template/${t.hash}.png&${t.imghash}`,
                        src: `/dcover/default/template/${t.hash}.png&${t.imghash}`
                    })),
                    idx
                })
            },
            async edit(id)
            {
                let error, edit, data, tmpl = id

                try {

                    // ({ data } = await this.$axios.get('/cover/template', { responseType: 'blob', params: { hash } }))
                    ({ data } = await axios.get(`/dcover/default/structs/${id}.wxg`, { responseType: 'blob' }))

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
                    this.$store.commit('cover/set', { edit, tmpl })
                    this.designer ? this.$bus.$emit('edit:tmpl') : await this.$router.push('/designer')
                }
            },
            async choose(id)
            {
                let data

                if (this.$store.state.app.user) {
                    ({ data } = await this.$axios.get('/cover/templates', { params: { id } }))
                }
                if (!data || !data.install) {
                    return this.$bus.$emit('snack', { content: 'common.auth_error', color: 'error' })
                }

                await this.$store.dispatch('cover/coversLoad', {})

                this.$bus.$emit('snack', {
                    content: 'common.selected',
                    color: 'success'
                })
            },
            async setTags()
            {
                let error, data

                try {

                    ({ data } = await this.$axios.post('/template/tags', { hash: this.hash, tags: this.marks }))

                    switch (true) {
                        case !!data.error:
                            error = data.error
                            break

                        case !!data.set:
                            this.$bus.$emit('snack', { content: 'Tags saved', color: 'success', raw: true })
                            this.templates = this.$store.state.cover.templates.map(tmpl => {
                                if (tmpl._id === this.hash) {
                                    tmpl.tags = this.marks
                                }

                                return tmpl
                            })
                    }

                } catch (e) {
                    error = e.message
                }

                this.dialog = false

                if (error) {
                    return this.$bus.$emit('snack', { content: error, color: 'error', raw: true })
                }
            },
            tags(hash)
            {
                this.marks = this.$store.state.cover.templates
                    .find(t => t._id === hash)?.tags || []

                this.hash = hash
                this.dialog = true
            },
            load({ el })
            {
                const holder = el.querySelector('.v-image__placeholder'),
                    img = el.querySelector('.v-image__image'),
                    url = img.style.backgroundImage

                if (/\/dcover\/default/.test(url)) return

                if (el.dataset && el.dataset.src) {
                    this.$store.dispatch('cover/cacheImage', el.dataset)
                    img.style.backgroundImage = `url(${el.dataset.src})`
                    img.style.backgroundPosition = 'center center'
                }

                img.classList.remove('v-image__image--preload')

                holder && holder.remove()
            },
            preload(entity)
            {
                const { collection, templates } = this.$store.state.cover

                if (entity !== 'templates' || collection.size >= 2 * templates.length) {
                    return this.revoke()
                }

                this.revoke = each(this.templates, async (_, i) => {
                    await this.preCache(i)
                }, 50)
            }
        },
        mounted()
        {
            this.$nextTick().then(() => this.$emit('update'))

            if (this.designer) {
                this.preload('templates')
            }
        },
        beforeDestroy()
        {
            this.revoke()
        }
    }
</script>

<style lang="scss" scoped>
    .templates-list {
        .cover-template--row {
            position: relative;

            &.last {
                margin-bottom: 15px;
            }
            &:not(:first-child) {
                margin-top: 10px;
            }
            .cover-template--image-wrapper {
                position: relative;
                cursor: pointer;

                .cover-template--image {
                    display: block;
                    height: 223px;
                    width: 100%;

                    background-position: 50%;
                    background-size: cover;
                    vertical-align: middle;
                }
                .cover-template--overlay {
                    position: absolute;
                    left: 0;
                    top: 0;

                    height: 100%;
                    width: 100%;

                    transition: opacity 40ms linear;
                    background-color: #000;
                    color: white;
                    opacity: 0;

                    text-align: center;
                    line-height: 223px;
                    font-size: 1.2rem;
                }
                &:hover .cover-template--overlay {
                    opacity: .5;
                }
            }
            .cover-template--controls {
                position: absolute;
                display: flex;
                bottom: 10px;
                left: 10px;

                .cover-template--button {
                    min-width: 170px;
                    margin: 0 0 0 7px;

                    background-color: #0f9d58 !important;
                    color: white;

                    ::v-deep .v-btn__content {
                        justify-content: space-around !important;

                        .v-btn {
                            z-index: 1;
                        }
                    }
                }
            }
        }
    }
    .tags-dialog__card {
        .tags-dialog__btn-wrapper {
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
        .tags-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
        }
        .tags-dialog__card-pane {
            padding: 15px;

            & > .layout {
                .v-chip--removable .v-chip__content {
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .input-query {
                    align-items: center;
                    padding: 0 1em;

                    .type-select {
                        flex: 0 5 100px;
                    }
                    .url-field {
                        flex: 5 0 10%;
                        max-width: 100%;
                    }
                }
                .fieldset {
                    position: relative;
                    padding: 10px 0;
                    margin: 7px 0;

                    background-color: white;
                    border: 2px solid rgba(0,0,0,.54);
                    border-radius: 5px;

                    &:last-child {
                        margin: 7px 0 0;
                    }
                    .legend {
                        position: absolute;
                        top: -14px;
                        left: 0;

                        margin-left: 10px;
                        padding: 0 5px;

                        white-space: nowrap;
                        background-color: inherit;
                        user-select: none;
                        z-index: 1;
                    }
                    .v-input--selection-controls {
                        margin: 10px 0 0 10px;

                        .v-input__slot {
                            margin: 0;

                            & > .v-label {
                                display: block;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                overflow: hidden;
                            }
                        }
                    }
                    .input-query .v-select__selection {
                        user-select: none;
                    }
                    .v-chip .v-chip__content {
                        user-select: none;
                        cursor: pointer;
                    }
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .tags-dialog__card-pane {
                max-height: calc(100vh - 61px);
            }
        }
        &.theme--dark {
            .tags-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
</style>
