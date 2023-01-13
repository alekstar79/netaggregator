<template>
    <v-container class="widget-page" justify-content-center>
        <client-only>
            <swiper :options="options" auto-destroy @ready="onReady">
                <template v-for="(m, i) in modules">
                    <swiper-slide :key="`widget-${i}-${m.entity}`">
                        <lazy-component :is="m.cmp" @update="updateSwiper" />
                    </swiper-slide>
                </template>
            </swiper>

            <div :class="`widget-page__notice outer-container theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
                <div class="inner-container disabled--text">
                    <p>
                        <sub>
                            {{ $t('widget.notice_txt') }} <a
                                href="https://vk.com/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                            >{{ $t('widget.notice_lnk') }}</a>.
                        </sub>
                    </p>
                </div>
            </div>
            <div v-if="controlls" class="widget-page__controls" :key="forceReload.controls[entity]">
                <v-btn class="widget-menu" @click="openToolDialog()" :color="color" aria-label="menu" fab>
                    <v-icon>mdi-view-list</v-icon>
                </v-btn>
                <v-btn class="add-to-community" @click="addToCommunity()" :color="color" aria-label="community" fab>
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn class="get-code" @click="openCodeDialog" :color="color" aria-label="code" fab>
                    <v-icon>mdi-code-tags</v-icon>
                </v-btn>
            </div>
        </client-only>

        <lazy-widget-variables />

        <v-dialog v-model="authorize" :width="mobile ? '100%' : '400px'" :fullscreen="mobile">
            <lazy-core-vk-transition :group="group" :action="transition" :fullscreen="mobile" @close="authorize = false" />
        </v-dialog>

        <v-dialog v-model="mark"
            :fullscreen="fullscreen"
            :max-width="fullscreen ? '100%' : '700px'"
            :key="forceReload.code[entity]"
        >
            <lazy-widget-code-dialog
                @update="closeCodeDialog"
                :fullscreen="fullscreen"
                :set="code"
            />
        </v-dialog>

        <lazy-widget-tool-dialog
            @update="closeToolDialog"
            v-model="tool"
            :set="set"
        />
    </v-container>
</template>

<script>
    import { common, loader, crawler, code, storage, error as emixin } from '~/mixins/widget'
    import { context, community, slide } from '~/mixins/common'

    import { widget, modules } from '~/assets/data/widget'

    import { rndstring } from '~/utils/common/symbols.mjs'
    import { debounce } from '~/utils/common/debounce.mjs'
    import { error } from '~/utils/widget'

    const // description = 'Конструктор виджетов - сервис интеграции информационных блоков на страницу сообщества. Гибко настраивает контент, внешний вид блока и полностью берет на себя, встраивание в интерфейс ВКонтакте.',
        description = 'Netagregator - удобный инструмент, который поможет Вам сделать виджеты в вк для группы. Все для управления сообществом в одном месте!',
        title = 'Конструктор виджетов ВК | Виджеты ВКонтакте для групп'

    const enforce = () => ['controls', 'tools', 'code'].reduce(
        (acc, b) => ({ ...acc, [b]: modules.reduce((acc, m) => ({ ...acc, [m.entity]: rndstring() }), {}) }),
        {}
    ),

        tools = [
            { icon: 'mdi-format-list-bulleted', module: 'SaveList', cmp: 'widget-save-list' },
            { icon: 'mdi-cogs', module: 'MainSettings', cmp: 'widget-main-settings' }
        ]

    export default {
        name: 'PageWidget',

        mixins: [community, common, loader, crawler, code, storage, emixin, context, slide],

        head() {
            return {
                title: this.$t('common.widget'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru/widget' },
                    { name: 'twitter:card',        hid: 'twitter:card',        content: 'summary_large_image' },
                    { name: 'twitter:title',       hid: 'twitter:title',       content: title },
                    { name: 'twitter:description', hid: 'twitter:description', content: description },
                    { name: 'twitter:image',       hid: 'twitter:image',       content: 'https://netaggregator.ru/icon.png' }
                ]
            }
        },
        jsonld()
        {
            return {
                '@context': 'https://schema.org/',
                '@type': 'WebSite',
                name: 'Конструктор виджетов',
                url: 'https://netaggregator.ru/widget',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        data: () => ({
            module: 'widget',

            forceReload: enforce(),

            inprocess: false,
            controlls: false,
            authorize: false,

            menu: false,
            mark: false,
            tool: false,

            error: null,
            code: '',

            set: {
                tools: []
            }
        }),
        computed: {
            fullscreen() {
                return this.mobile || !!this.$store.state.app.vkapp || false
            },
            presentation() {
                return this.$store.state.app.presentation
            }
        },
        watch: {
            // '$store.state.app.tilt': 'toggleTilt',

            mark() {
                this.forceReload = enforce()
            },

            entity: 'loadModule',
            utoken: 'execute',
            groups: 'execute',
            user:   'execute'
        },
        methods: {
            loadModule()
            {
                return this.$store.dispatch('widget/load').then(this.swipe).then(this.updateSwiper)
            },
            execute()
            {
                if (!this.authorized || this.inprocess) return

                this.inprocess = true

                return Promise.resolve(this.groups)
                    .then(groups => {
                        if (this.groups_id_freeze) return

                        const vk_gid = this.vkapp && this.vkapp.vk_group_id,
                            group_id = this.group_id,

                            first = groups.length ? groups[0] : {}

                        this.group_id = vk_gid || group_id || first.id || first.value || null
                    })
                    .then(this.keys)
                    .then(this.load)
                    .catch(this.errorHandler)
            },
            keyLoadCompleted()
            {
                this.inprocess = false
            },
            async reload(action)
            {
                this.widget = widget()

                switch (action) {
                    case 'login':
                        await this.execute()
                        break
                    case 'logout':
                        this.commit({})
                        break
                }

                this.forceReload = enforce()

                this.$forceUpdate()
            },
            openToolDialog(tab)
            {
                const save = Object.keys(this.$store.state.widget.save),
                    isTab = typeof tab !== 'undefined'

                isTab || (tab = save.length ? 0 : 1)

                this.set = { tab, tools }
                this.mark = false
                this.tool = true
            },
            closeToolDialog()
            {
                this.tool = false

                this.set = { tools: [] }
            },
            openCodeDialog()
            {
                this.code = this.getCode(false)
                this.tool = false
                this.mark = true
            },
            closeCodeDialog(data)
            {
                setTimeout(() => this.code = '', 500)

                this.mark = false
                if (!data) return

                try {

                    this.merge()
                    this.data = this.merge(data)

                } catch (e) {
                    this.$bus.$emit('snack', error('Parse error', true))
                }
            },
            transition()
            {
                this.$ls.set('doit', {
                    route: 'widget',
                    action: 'setCommunityToken',
                    entity: this.entity,
                    params: this.group_id
                })
            },
            async initWidget()
            {
                let doit = await this.$ls.get('doit'),
                    once = () => doit.action && this[doit.action](doit.params)

                if (doit && doit.entity) {
                    doit.entity !== this.entity
                        ? this.onceOnEvent('swipe:completed', once)
                        : once()

                    this.entity = doit.entity

                    this.$ls.set('doit', null)
                }

                this.initCommonModule()
                await this.execute()

                this.loadModule().finally(() => {
                    this.controlls = true
                    this.$bus.$emit('loading:finish')
                })
            }
        },
        created()
        {
            this.execute = debounce.call(this, this.execute)
        },
        mounted()
        {
            this.$bus.$on('settings:reload', this.reload)
            this.$on('swiper:ready', this.initWidget)
        }
    }
</script>

<style lang="scss" scoped>
    .widget-page {
        justify-content: center;

        ::v-deep .swiper-container .swiper-wrapper {
            .module {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                box-sizing: border-box;
                max-width: 550px;
                width: 100%;

                font-size: 13px;

                .widget-header {
                    align-items: center;
                    min-height: 55px;

                    .widget-header__title {
                        font-size: 16px;
                    }
                    .widget-header__controls {
                        display: flex;
                        flex-wrap: wrap;
                        font-weight: 500;
                        padding: 0 7px;
                    }
                }
            }
        }
        .widget-page__notice.outer-container,
        .widget-page__controls {
            display: flex;
            justify-content: center;

            .inner-container {
                max-width: 550px;
                margin-bottom: 30px;
                text-align: center;
                font-weight: normal;
                font-size: 16px;

                p sub {
                    word-break: break-word;
                    white-space: pre-line;
                    bottom: 1em;
                }
                a,
                a:active,
                a:visited {
                    color: #82b1ff
                }
            }
            &.theme--dark .inner-container {
                color: #7a7a7a;
            }
            .add-to-community,
            .widget-menu,
            .get-code {
                border-radius: 50%;
                margin: 0 10px;

                box-shadow:
                    0 3px 1px -2px rgba(0,0,0,.2),
                    0 2px 2px 0 rgba(0,0,0,.14),
                    0 1px 5px 0 rgba(0,0,0,.12) !important;

                &.theme--dark {
                    color: #7a7a7a;
                }
            }
        }
        ::v-deep .flat_btn {
            box-sizing: border-box;
            display: block;
            padding: 0;
            margin: 0;

            text-decoration: none;
            text-align: center;
            white-space: nowrap;
            line-height: 15px;

            vertical-align: top;
            cursor: pointer;
            outline: none;
        }
        ::v-deep .load-more__btn,
        ::v-deep .add-item__btn {
            padding: 14px 0;
            margin: 0;

            transition: background-color 40ms linear;
            border-top: 1px solid #e7e8ec;
            border-radius: 0 0 4px 4px;
            background-color: #fff;
            color: #2a5885;

            &:hover {
                background-color: #f0f2f5;
            }
        }
        ::v-deep .slim {
            padding: 5px 0;
        }
        ::v-deep .vert {
            padding: 0 5px;

            .load-more__btn--label {
                display: block;
            }
        }
        ::v-deep .add-item__btn {
            border-radius: 0;
            border: 0;
        }
        ::v-deep .load-more__btn--label {
            box-sizing: border-box;
            display: inline-block;
            padding: 0 28px;
            margin: 0 -28px;
            max-width: 100%;

            vertical-align: top;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        ::v-deep .swiper-container {
            padding: 25px 0;
            z-index: 0;
        }
    }
    @media all and (max-width: 375px) {
        .widget-page {
            padding-right: 0 !important;
            padding-left: 0 !important;
            padding-top: 0 !important;

            ::v-deep .module {
                width: 100% !important;
            }
        }
        ::v-deep .v-dialog {
            margin: 0 !important;
            width: 100%;
        }
    }
</style>
