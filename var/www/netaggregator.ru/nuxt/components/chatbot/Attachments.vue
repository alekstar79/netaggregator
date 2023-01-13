<template>
    <v-layout class="chatbot-dialogs__attachments"
        :class="{ fullscreen: mobile, [`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`]: true }"
    >
        <div class="chatbot-dialogs__tabs" :key="force">
            <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

            <template v-if="mobile && $store.state.app.vkapp">
                <v-layout v-show="type === 'albums'" class="chatbot-dialogs__btn-wrapper" justify-start>
                    <v-btn v-for="(t, i) in media" @click="init(t)" :key="i" aria-label="tools" icon>
                        <v-icon>{{ t.icon }}</v-icon>
                    </v-btn>
                </v-layout>
                <v-layout v-show="type !== 'albums'" class="chatbot-dialogs__btn-wrapper" justify-start>
                    <v-btn @click="retreat" aria-label="return" icon>
                        <v-icon>mdi-keyboard-backspace</v-icon>
                    </v-btn>
                </v-layout>
            </template>
            <template v-else>
                <client-only>
                    <v-tabs v-show="type === 'albums'"
                        class="chatbot-dialogs__tabs-header"
                        :slider-color="color"
                        :color="color"
                        height="60px"
                        show-arrows
                        hide-slider
                        grow
                    >
                        <v-tab v-for="(t, i) in media" @click="init(t)" :key="i" :ripple="false">
                            <v-icon :color="color">{{ t.icon }}</v-icon>
                        </v-tab>
                    </v-tabs>
                    <v-tabs v-show="type !== 'albums'"
                        class="chatbot-dialogs__tabs-header"
                        :color="color"
                        height="60px"
                        hide-slider
                        grow
                    >
                        <v-tab @click="retreat" :ripple="false">
                            <v-icon :color="color">mdi-keyboard-backspace</v-icon>
                        </v-tab>
                    </v-tabs>
                </client-only>
            </template>

            <div class="chatbot-dialogs__tabs-content" :class="{ fit: type !== 'albums' }">
                <v-layout column>
                    <v-flex v-if="type === 'albums'" class="source__chooser" ma-3>
                        <div v-if="!groups.length">
                            <h4>{{ $t('chatbot.no_managed') }}</h4>
                        </div>
                        <v-select
                            v-model="gid"
                            :item-color="color"
                            :items="sources"
                            :color="color"
                            :height="30"
                            hide-details
                            dense
                        />
                    </v-flex>
                    <lazy-chatbot-v-scroller
                        @click="choose"
                        @load="get()"
                        v-bind="{
                            check: type !== 'albums' || entity.id === 'doc',
                            list: sourcesList,
                            media: entity
                        }"
                    />
                </v-layout>
            </div>
        </div>
    </v-layout>
</template>

<script>
    import { rndstring } from '~/utils/common/symbols.mjs'
    import { openLink } from '~/utils/common/open.mjs'
    import { spoof } from '~/utils/common/spoof.mjs'

    import { removeFromList } from '~/utils/chatbot'
    import { community } from '~/mixins/common'

    import { attachments } from '~/assets/data/chatbot'
    import icons from '~/assets/data/doc-icons'

    import { mapState } from 'vuex'

    const ratio = { s: 1, o: 2, m: 3, p: 4, q: 5, x: 6, y: 7, z: 8, w: 9 },
        height = 310,

        media = [
            { id: 'exit',  icon: 'mdi-window-close', src: ''     },
            { id: 'photo', icon: 'mdi-camera', src: 'thumb_src'  },
            { id: 'video', icon: 'mdi-video',  src: 'photo_320'  },
            { id: 'doc',   icon: 'mdi-file-document', src: 'url' }
        ]

    export default {
        mixins: [community],

        props: {
            value: {
                type: Object,
                default: () => ({})
            },
            open: {
                type: Boolean,
                required: true
            }
        },
        model: {
            event: 'input',
            prop: 'value'
        },
        computed: {
            ...mapState('chatbot', ['idx', 'list']),
            ...mapState('app', ['color', 'user']),

            sources() {
                const converter = g => ({ ...g, text: spoof(g.name, this), value: g.id }),
                    groups = this.groups.slice()

                groups.unshift({ id: 0, name: this.$t('common.notselected') })

                return groups.map(converter)
            },
            select() {
                return this.groups?.length && !this.sourcesList.length
            },
            mobile() {
                return !!(this.$BROWSER || { IS_MOBILE: true }).IS_MOBILE
            },
            window() {
                return this.$store.state.app.window || { height }
            }
        },
        watch: {
            open: 'possibleSource',

            'value.attachments'(v = []) {
                if (!v.length) return

                this.sourcesList.forEach(item => {
                    item.checked = v.some(a => a.mark === item.mark)
                })
            },
            gid(v, o) {
                this.groupTokenResolver(v)
                    .then(token => {
                        this.token = token

                        if (o !== v) {
                            this.reset()
                        }
                        if (token) {
                            this.init()
                        }
                    })
            }
        },
        data: () => ({
            photos: { count: 0, items: [], album_id: null, empty: false },
            videos: { count: 0, items: [], album_id: null, empty: false },
            docs:   { count: 0, items: [], album_id: null, empty: false },

            photoAlbums: { count: 0, items: [], empty: false },
            videoAlbums: { count: 0, items: [], empty: false },

            sourcesList: [],
            progress: false,
            empty: false,

            token: null,
            gid: 0,

            entity: media[1],
            type: 'albums',
            media
        }),
        methods: {
            possibleSource()
            {
                return new Promise(resolve => {
                    if (!this.list.length || this.idx == null) {
                        return resolve()
                    }

                    let dialog = this.list[this.idx],
                        groups = dialog.connections,
                        token, gid, i = 0

                    if (!groups.length) {
                        return this.findToken(resolve)
                    }

                    while ((gid = groups[i]) && !token) {
                        token = (this.groups.find(g => g.id === gid) || {}).token

                        if (token) {
                            this.gid = gid
                            break
                        }

                        i++
                    }

                    resolve()
                })
            },
            async findToken(resolve)
            {
                for (const group of this.groups) {
                    if (group.token && await this.apply(group)) {
                        resolve()
                        break
                    }
                }
            },
            apply({ id })
            {
                return new Promise(resolve => {
                    this.$bus.$once('group:apply', resolve)
                    this.gid = id
                })
            },
            init(entity)
            {
                entity || (entity = this.entity)

                if (entity.id === 'exit') {
                    this.$emit('close')
                }
                if (!this.gid || entity.id === 'exit') {
                    this.sourcesList = []
                    return
                }

                this.progress = false
                this.entity = entity
                this.type = 'albums'

                switch (entity.id) {
                    case 'photo':
                        this.sourcesList = this.photoAlbums.items.slice()
                        this.empty = this.photoAlbums.empty
                        break
                    case 'video':
                        this.sourcesList = this.videoAlbums.items.slice()
                        this.empty = this.videoAlbums.empty
                        break
                    case 'doc':
                        this.sourcesList = this.docs.items.slice()
                        this.empty = this.docs.empty
                        break
                }

                if (!this.sourcesList.length) {
                    this.get()
                }
            },
            reset()
            {
                this.photos = { count: 0, items: [], album_id: null, empty: false }
                this.videos = { count: 0, items: [], album_id: null, empty: false }
                this.docs   = { count: 0, items: [], album_id: null, empty: false }

                this.photoAlbums = { count: 0, items: [], empty: false }
                this.videoAlbums = { count: 0, items: [], empty: false }

                this.sourcesList = []
                this.progress = false
                this.empty = false

                this.type = 'albums'
            },
            retreat()
            {
                const entity = this.entity.id

                this.type = 'albums'

                switch (entity) {
                    case 'photo':
                    case 'video':
                        this.sourcesList = this[entity + 'Albums'].items
                        this[entity + 's'] = { count: 0, items: [], album_id: null, empty: false }
                        break

                    case 'doc':
                        this.sourcesList = this.docs.items
                }
            },
            preload(items)
            {
                let analyzer = ({ type: a },{ type: b }) => (ratio[a] || 0) < (ratio[b] || 0) ? 1 : -1,
                    mark, { type, entity, value: { attachments = [] } = {} } = this

                items.forEach(item => {
                    item.key = rndstring()

                    if (type === 'files' || entity.id === 'doc') {
                        mark = `${entity.id}${item.owner_id}_${item.id}`
                        item.checked = attachments.some(a => a.mark === mark)
                        item.mark = mark

                        if (entity.id === 'photo') {
                            item[entity.src] = item.sizes.find(s => s.type === 'o').url
                            item.url = item.sizes.sort(analyzer).shift().url
                        }
                        if (entity.id === 'doc') {
                            item.icon = icons[item.type]
                        }
                    }
                })
            },
            async get()
            {
                if (this.progress) return

                this.progress = true

                const album = this.type === 'albums'

                switch (this.entity.id) {
                    case 'photo': await (album ? this.getPhotoAlbums() : this.getPhotos()); break
                    case 'video': await (album ? this.getVideoAlbums() : this.getVideos()); break
                    case 'doc': await this.getDoc()
                }

                this.$bus.$emit('group:apply', !!this.sourcesList.length)
            },
            async getPhotoAlbumsCount()
            {
                try {

                    let r

                    if (!this.$store.state.app.fake) {
                        r = await this.$axios.$post('/bypass', {
                            method: '/photos.getAlbumsCount',
                            group_id: this.gid,
                            uid: this.user.id
                        })
                    } else {
                        r = { response: 12 }
                    }
                    if ('error' in r) {
                        this.$bus.$emit('snack', { content: r.error.error_msg || r.error, color: 'error', raw: true })
                    }
                    if ('response' in r) {
                        this.photoAlbums.empty = !r.response
                        this.photoAlbums.count = r.response
                    }

                } catch (e) {
                    this.$bus.$emit('snack', { content: e.message, color: 'error', raw: true })
                }
            },
            async getPhotoAlbums()
            {
                try {

                    let r

                    if (this.photoAlbums.empty || (this.photoAlbums.items.length && this.photoAlbums.items.length >= this.photoAlbums.count))
                    {
                        this.progress = false
                        return
                    }
                    if (!this.photoAlbums.empty && !this.photoAlbums.count) {
                        await this.getPhotoAlbumsCount()
                    }
                    if (!this.$store.state.app.fake) {
                        r = await this.$axios.$post('/bypass', {
                            method: '/photos.getAlbums',
                            owner_id: -this.gid,
                            uid: this.user.id,
                            need_covers: 1,
                            need_system: 1
                        })
                    } else {
                        r = {
                            response: attachments
                        }
                    }
                    if ('error' in r) {
                        this.$bus.$emit('snack', { content: r.error.error_msg || r.error, color: 'error', raw: true })

                    } else if ('response' in r) {
                        this.preload(r.response.items)
                        this.photoAlbums.items = this.photoAlbums.items
                            .concat(r.response.items)
                    }

                    this.sourcesList = this.photoAlbums.items
                    this.progress = false

                } catch (e) {
                    this.$bus.$emit('snack', { content: e.message, color: 'error', raw: true })
                }
            },
            async getPhotos()
            {
                try {

                    if (this.photos.empty || (this.photos.items.length && this.photos.items.length >= this.photos.count))
                    {
                        this.progress = false
                        return
                    }

                    let offset = this.photos.items.length,
                        album_id = this.photos.album_id,
                        count = 100,
                        r

                    if (!this.$store.state.app.fake) {
                        r = await this.$axios.$post('/bypass', {
                            method: '/photos.get',
                            owner_id: -this.gid,
                            uid: this.user.id,
                            album_id,
                            offset,
                            count
                        })
                    }
                    if ('error' in r) {
                        this.$bus.$emit('snack', { content: r.error.error_msg || r.error, color: 'error', raw: true })

                    } else if ('response' in r) {
                        this.photos.empty = !r.response.count
                        this.photos.count = r.response.count

                        this.preload(r.response.items)

                        this.photos.items = this.photos.items
                            .concat(r.response.items)
                    }

                    this.sourcesList = this.photos.items
                    this.progress = false

                } catch (e) {
                    this.$bus.$emit('snack', { content: e.message, color: 'error', raw: true })
                }
            },
            async getVideoAlbums()
            {
                try {

                    if (this.videoAlbums.empty || (this.videoAlbums.items.length && this.videoAlbums.items.length >= this.videoAlbums.count))
                    {
                        this.progress = false
                        return
                    }

                    let offset = this.videoAlbums.items.length,
                        count = 100,
                        r

                    if (!this.$store.state.app.fake) {
                        r = await this.$axios.$post('/bypass', {
                            method: '/video.getAlbums',
                            owner_id: -this.gid,
                            uid: this.user.id,
                            need_system: 1,
                            extended: 1,
                            offset,
                            count
                        })
                    }
                    if ('error' in r) {
                        this.$bus.$emit('snack', { content: r.error.error_msg || r.error, color: 'error', raw: true })

                    } else if ('response' in r) {
                        this.videoAlbums.empty = !r.response.count
                        this.videoAlbums.count = r.response.count

                        this.preload(r.response.items)

                        this.videoAlbums.items = this.videoAlbums.items
                            .concat(r.response.items)
                    }

                    this.sourcesList = this.videoAlbums.items
                    this.progress = false

                } catch (e) {
                    this.$bus.$emit('snack', { content: e.message, color: 'error', raw: true })
                }
            },
            async getVideos()
            {
                try {

                    if (this.videos.empty || (this.videos.items.length && this.videos.items.length >= this.videos.count))
                    {
                        this.progress = false
                        return
                    }

                    let offset = this.videos.items.length,
                        album_id = this.videos.album_id,
                        count = 100,
                        r

                    if (!this.$store.state.app.fake) {
                        r = await this.$axios.$post('/bypass', {
                            method: '/video.get',
                            owner_id: -this.gid,
                            uid: this.user.id,
                            album_id,
                            offset,
                            count
                        })
                    }
                    if ('error' in r) {
                        this.$bus.$emit('snack', { content: r.error.error_msg || r.error, color: 'error', raw: true })

                    } else if ('response' in r) {
                        this.videos.empty = !r.response.count
                        this.videos.count = r.response.count

                        this.preload(r.response.items)

                        this.videos.items = this.videos.items
                            .concat(r.response.items)
                    }

                    this.sourcesList = this.videos.items
                    this.progress = false

                } catch (e) {
                    this.$bus.$emit('snack', { content: e.message, color: 'error', raw: true })
                }
            },
            async getDoc()
            {
                try {

                    if (this.docs.empty || (this.docs.items.length && this.docs.items.length >= this.docs.count))
                    {
                        this.progress = false
                        return
                    }

                    let offset = this.docs.items.length,
                        count = 100,
                        r

                    if (!this.$store.state.app.fake) {
                        r = await this.$axios.$post('/bypass', {
                            method: '/docs.get',
                            owner_id: -this.gid,
                            uid: this.user.id,
                            offset,
                            count
                        })
                    }
                    if ('error' in r) {
                        this.$bus.$emit('snack', { content: r.error.error_msg || r.error, color: 'error', raw: true })

                    } else if ('response' in r) {
                        this.docs.empty = !r.response.count
                        this.docs.count = r.response.count

                        this.preload(r.response.items)

                        this.docs.items = this.docs.items
                            .concat(r.response.items)
                    }

                    this.sourcesList = this.docs.items
                    this.progress = false

                } catch (e) {
                    this.$bus.$emit('snack', { content: e.message, color: 'error', raw: true })
                }
            },
            insert(item)
            {
                let attachments = [].concat(this.value?.attachments || []),
                    index = attachments.findIndex(a => a.mark === item.mark)

                if (index > -1) {
                    attachments = removeFromList(attachments, index)
                } else {
                    attachments.push({
                        src: item[this.entity.src],
                        entity: this.entity.id,
                        title: item.title,
                        icon: item.icon,
                        size: item.size,
                        mark: item.mark,
                        url: item.url
                    })
                }

                this.$emit('input', { ...this.value, attachments })
            },
            choose({ click, check })
            {
                const entity = this.entity.id

                if (check) {
                    this.insert(check)
                    return
                }
                if (['photo','video'].includes(entity) && this.type === 'albums') {
                    this[entity + 's'].album_id = click.id
                    this.type = 'files'
                    this.get()
                    return
                }

                openLink(`https://vk.com/${click.mark}`)
            }
        },
        mounted()
        {
            setTimeout(() => {
                this.possibleSource()
            }, 250)
        }
    }
</script>

<style lang="scss" scoped>
    .chatbot-dialogs__attachments {
        &.fullscreen {
            height: 100vh;

            .chatbot-dialogs__tabs .chatbot-dialogs__tabs-content {
                height: calc(100vh - 90px);
            }
        }
        .chatbot-dialogs__tabs {
            box-sizing: border-box;
            width: 100%;

            background-color: #fff;

            .chatbot-dialogs__btn-wrapper {
                padding: 0 10px;

                ::v-deep .v-btn {
                    margin: 0 5px;
                }
            }
            .chatbot-dialogs__tabs-header {
                border-bottom: 1px solid #e3e4e8;

                ::v-deep .v-tabs__div {
                    transition: background-color .4s;

                    &:hover {
                        background-color: rgba(70,70,70,.1);
                    }
                }
            }
            .chatbot-dialogs__tabs-content {
                height: 400px;

                ::v-deep .layout {
                    height: 100%;

                    .source__chooser {
                        max-height: 32px;
                        flex: inherit;

                        .v-text-field {
                            font-size: 16px;

                            .v-input__control > .v-input__slot {
                                padding: 5px;

                                &:before {
                                    border: none;
                                }
                                &:after {
                                    border: none;
                                }
                            }
                        }
                    }
                }
            }
        }
        &.theme--dark .chatbot-dialogs__tabs {
            background-color: #1e1e1e;

            .chatbot-dialogs__tabs-header {
                border-bottom: 1px solid #424242;
            }
            .chatbot-dialogs__tabs-content {
                ::v-deep .scrollbar-track .scrollbar-thumb {
                    background: #424242;
                }
                ::v-deep .layout .source__chooser {
                    .v-input.v-text-field {

                        .v-input__control > .v-input__slot {
                            .v-select__selection, .v-icon {
                                color: #7a7a7a !important;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
