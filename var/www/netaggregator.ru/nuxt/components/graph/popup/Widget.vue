<template>
    <graph-drag hash="widget"
        class="widget-settings"
        @close="$emit('tool:cancel')"
        :title="$t('graph.widget')"
        :close="true"
        :snap="snap"
    >
        <div class="widget-popup" :key="force">
            <v-flex v-if="widget" class="widget-pane">
                <v-select
                    v-if="widget.type === 'widget-profile'"
                    :menu-props="{ closeOnContentClick: true }"
                    @change="updateProfile"
                    :value="widget.profile"
                    :item-color="color"
                    :color="color"
                    :items="profiles"
                    persistent-hint
                    return-object
                    hide-details
                    outlined
                    dense
                >
                    <template #selection="{ item }">
                        <div class="compacted">
                            {{ $t(`graph.${item}`) }}
                        </div>
                    </template>
                    <template #item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs" :disabled="item !== 'user' && installed.profiles.includes(item)">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ $t(`graph.${item}`) }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-select>

                <helper-fieldset v-if="widget.type === 'widget-profile'" class="pt-3" dense>
                    <template #content>
                        <v-checkbox
                            v-model="widget.rounded"
                            :label="$t('graph.rounded')"
                            :ripple="false"
                            :color="color"
                            hide-details
                            dense
                        />
                    </template>
                </helper-fieldset>

                <template v-if="widget.type === 'widget-json'">
                    <v-flex class="widget__input--textarea pt-1">
                        <v-text-field v-model="widgetJsonSid"
                            @click="copy('widgetJsonSid')"
                            :label="$t(`graph.sid`)"
                            :color="color"
                            hide-details
                            outlined
                            dense
                        />
                    </v-flex>
                </template>

                <helper-fieldset v-if="widget.type !== 'widget-profile'"
                    :class="`${widget.type === 'widget-json' ? 'pt-3' : 'pt-2'}`"
                    dense
                >
                    <template #content>
                        <v-checkbox
                            v-model="widget.icon"
                            :label="$t('graph.icon')"
                            :ripple="false"
                            :color="color"
                            hide-details
                            dense
                        />
                    </template>
                </helper-fieldset>

                <helper-fieldset v-if="widget.type === 'widget-currency'" class="pt-3" dense>
                    <template #content>
                        <v-checkbox
                            v-model="widget.short"
                            :ripple="false"
                            :color="color"
                            label="Short"
                            hide-details
                            dense
                        />
                    </template>
                </helper-fieldset>

                <helper-fieldset v-if="widget.type === 'widget-countdown'" class="pt-3" dense>
                    <template #content>
                        <v-checkbox
                            v-model="widget.marks"
                            :label="$t('graph.marks')"
                            :ripple="false"
                            :color="color"
                            hide-details
                            dense
                        />
                    </template>
                </helper-fieldset>

                <helper-fieldset v-if="widget.type === 'widget-rss'" class="visibility__item--checker pt-3" dense>
                    <template #content>
                        <v-checkbox
                            v-model="visibleTitle"
                            :label="$t('graph.title')"
                            :ripple="false"
                            :color="color"
                            hide-details
                            dense
                        />
                        <v-checkbox
                            v-model="visibleContent"
                            :label="$t('graph.content')"
                            :ripple="false"
                            :color="color"
                            hide-details
                            dense
                        />
                        <v-checkbox
                            v-model="visibleDate"
                            :label="$t('graph.date')"
                            :ripple="false"
                            :color="color"
                            hide-details
                            dense
                        />
                    </template>
                </helper-fieldset>
                <helper-fieldset
                    v-else-if="widget.type === 'widget-info' || widget.type === 'widget-weather'"
                    slotClasses="layout column align-start"
                    class="pt-3"
                    dense
                >
                    <template #content>
                        <template v-for="(item, i) in info">
                            <v-checkbox v-model="test"
                                :ripple="false"
                                :color="color"
                                :value="item"
                                :key="i"
                                hide-details
                                dense
                            >
                                <template #label>
                                    {{ $t(`graph.${item}`) }}
                                </template>
                            </v-checkbox>
                        </template>
                    </template>
                </helper-fieldset>

                <v-select
                    class="pt-2"
                    v-model="current"
                    :label="$t('graph.font')"
                    :color="color"
                    :items="list"
                    item-text="family"
                    return-object
                    hide-details
                    outlined
                    dense
                    :menu-props="{
                        contentClass: 'widget-fonts-menu',
                        maxWidth: 200
                    }"
                >
                    <template #item="{ item, on }">
                        <v-list-item v-on="on" class="fonts__menu--item ellipsisfont" :class="item.value">
                            {{ item.family }}
                        </v-list-item>
                    </template>
                </v-select>

                <helper-fieldset class="pt-3" dense>
                    <template #label>{{ $t('graph.color') }}</template>

                    <template #content>
                        <v-menu
                            transition="slide-y-transition"
                            content-class="fill-color-menu"
                            :close-on-content-click="false"
                            max-width="260px"
                            bottom
                            left
                        >
                            <template #activator="{ on }">
                                <v-btn v-on="on"
                                    :color="widgetTextFill"
                                    :ripple="false"
                                    elevation="0"
                                    x-small
                                    block
                                >
                                    &nbsp;
                                </v-btn>
                            </template>

                            <v-card class="color-dialog__body">
                                <v-color-picker
                                    v-model="widgetTextFill"
                                    canvas-height="135px"
                                    width="210px"
                                    dot-size="10"
                                    mode="hexa"
                                    hide-mode-switch
                                    flat
                                />
                                <v-btn class="color-copy" @click.stop="copy('widgetTextFill')" text>
                                    <span class="mdi mdi-content-copy" />
                                </v-btn>
                            </v-card>
                        </v-menu>
                    </template>
                </helper-fieldset>

                <helper-fieldset class="pt-3" dense>
                    <template #label>{{ $t('graph.size') }}</template>

                    <template #content>
                        <vue-slider v-model="widgetFontSize" v-bind="options" width="100%" />
                    </template>
                </helper-fieldset>

                <v-select
                    v-if="widget.type === 'widget-time'"
                    @change="updateTimezone"
                    :value="widget.timezone"
                    :items="timezones"
                    :item-color="color"
                    :color="color"
                    class="pt-2"
                    persistent-hint
                    hide-details
                    outlined
                    dense
                    :menu-props="{ closeOnContentClick: true }"
                >
                    <template #selection="{ item }">
                        <div class="compacted">
                            {{ item.text }}
                        </div>
                    </template>
                    <template #item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ item.text }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-select>

                <v-select
                    v-if="widget.type === 'widget-currency'"
                    @change="updateCurr"
                    :value="widget.curr"
                    :items="currency"
                    :label="$t('graph.curr')"
                    :item-color="color"
                    :color="color"
                    class="pt-2"
                    item-value="id"
                    item-text="name"
                    persistent-hint
                    hide-details
                    outlined
                    dense
                    :menu-props="{ closeOnContentClick: true }"
                >
                    <template #selection="{ item }">
                        <div class="compacted">
                            {{ item.id }}
                        </div>
                    </template>
                    <template #item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ item.name }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-select>

                <v-select
                    v-if="widget.type === 'widget-currency'"
                    @change="updateRate"
                    :value="widget.rate"
                    :items="currency"
                    :label="$t('graph.rate')"
                    :item-color="color"
                    :color="color"
                    class="pt-2"
                    item-value="id"
                    item-text="name"
                    persistent-hint
                    hide-details
                    outlined
                    dense
                    :menu-props="{ closeOnContentClick: true }"
                >
                    <template #selection="{ item }">
                        <div class="compacted">
                            {{ item.id }}
                        </div>
                    </template>
                    <template #item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ item.name }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-select>

                <helper-fieldset
                    v-if="['widget-feed','widget-info','widget-json','widget-rss','widget-weather'].includes(widget.type)"
                    class="widget__line-height pt-3"
                    dense
                >
                    <template #label>{{ $t('graph.line_height') }}</template>

                    <template #content>
                        <vue-slider v-model="widgetLineHeight" v-bind="lhOptions" width="100%" />
                    </template>
                </helper-fieldset>

                <helper-fieldset v-if="widget.type === 'widget-rss' || widget.type === 'widget-json'" class="pt-3" dense>
                    <template #label>{{ $t('graph.text_width') }}</template>

                    <template #content>
                        <vue-slider v-model="widgetTextWidth" v-bind="twOptions" width="100%" />
                    </template>
                </helper-fieldset>

                <helper-fieldset v-if="widget.type === 'widget-rss' || widget.type === 'widget-json'" class="pt-3" dense>
                    <template #label>{{ $t('graph.chars_count') }}</template>

                    <template #content>
                        <vue-slider v-model="widgetCharsCount" v-bind="ccOptions" width="100%" />
                    </template>
                </helper-fieldset>

                <v-text-field
                    v-if="widget.type === 'widget-profile' && widget.profile === 'user'"
                    v-model="userId"
                    color="rgba(0,0,0,.38);"
                    class="user-id pt-2"
                    label="UID"
                    hide-details
                    outlined
                    dense
                />

                <helper-fieldset
                    v-if="['widget-traffic','widget-json','widget-feed','widget-info','widget-rss','widget-weather'].includes(widget.type)"
                    class="widget-align pt-3"
                    dense
                >
                    <template #label>{{ $t('graph.align') }}</template>

                    <template #content>
                        <v-layout class="btn-toolbar" justify-space-between>
                            <template v-for="d in align">
                                <v-btn class="toolbar-item"
                                    @click="widget.textAlign = d"
                                    :ripple="false"
                                    :key="d"
                                    tile
                                    icon
                                >
                                    <v-icon :color="color" class="align-icon">
                                        {{ `mdi-format-align-${d}` }}
                                    </v-icon>
                                </v-btn>
                            </template>
                        </v-layout>
                    </template>
                </helper-fieldset>

                <v-flex v-if="widget.type === 'widget-json'" class="lorem__apply--btn pt-2">
                    <v-btn @click="widget.setJson()" class="shadowless" :color="color" small block>
                        {{ $t('graph.lorem') }}
                    </v-btn>
                </v-flex>

                <template v-if="widget.type === 'widget-rss'">
                    <template v-for="b in ['charset','channel']">
                        <v-flex class="widget__input--textarea pt-2" :key="b">
                            <v-textarea v-model="_self[`rss${b[0].toUpperCase() + b.slice(1)}`]"
                                :label="$t(`graph.${b}`)"
                                :color="color"
                                rows="1"
                                hide-details
                                outlined
                                dense
                            />
                        </v-flex>
                    </template>
                </template>

                <v-select
                    v-if="widget.type === 'widget-rss'"
                    @change="updateChannel"
                    :value="rssChannel"
                    :items="channels"
                    :item-color="color"
                    :color="color"
                    class="pt-2"
                    item-text="name"
                    item-value="src"
                    persistent-hint
                    hide-details
                    outlined
                    dense
                    :menu-props="{ closeOnContentClick: true }"
                >
                    <template #selection="{ item }">
                        <div class="compacted">
                            {{ item.name }}
                        </div>
                    </template>
                    <template #item="{ item, on, attrs }">
                        <v-list-item v-on="on" v-bind="attrs">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ item.name }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-select>

                <date-picker
                    v-if="widget.type === 'widget-countdown'"
                    v-bind="datePickerOptions"
                    v-model="timestamp"
                    class="pt-1"
                />

                <v-autocomplete
                    v-if="widget.type === 'widget-weather'"
                    :search-input.sync="geoSearch"
                    :loading="geoIsLoading"
                    :label="$t('common.city')"
                    v-model="widget.city"
                    :items="geoItems"
                    :item-color="color"
                    :color="color"
                    class="pt-2"
                    item-text="title"
                    item-value="geoid"
                    auto-select-first
                    allow-overflow
                    return-object
                    hide-details
                    outlined
                    dense
                >
                    <template #item="{ item, on, attrs }">
                        <v-list-item v-bind="attrs" v-on="on" class="cities__menu--item geo">
                            <span>{{ item.title }}</span>
                            <sub>{{ item.subtitle }}</sub>
                        </v-list-item>
                    </template>
                </v-autocomplete>
                <v-select
                    v-else-if="widget.type === 'widget-traffic'"
                    v-model="widget.code"
                    class="pt-2"
                    :color="color"
                    :items="widget.clist"
                    :label="$t('common.city')"
                    item-value="geoid"
                    item-text="title"
                    return-object
                    hide-details
                    outlined
                    dense
                    :menu-props="{
                        contentClass: 'widget-cities-menu',
                        maxWidth: 200
                    }"
                >
                    <template #item="{ item, on }">
                        <v-list-item v-on="on" class="cities__menu--item ellipsisfont">
                            {{ item.title }}
                        </v-list-item>
                    </template>
                </v-select>

                <template v-if="widget.type === 'widget-feed'">
                    <helper-fieldset class="add-feed pt-2" dense>
                        <template #content>
                            <v-btn @click="add" icon x-small block>
                                <v-icon dense>mdi-plus</v-icon>
                            </v-btn>
                        </template>
                    </helper-fieldset>

                    <slick-list
                        :value="widget.feed"
                        @sort-end="changeList"
                        helperClass="feed-info"
                        appendTo=".feed-info"
                        class="feed-info"
                        lockToContainerEdges
                        lockOffset="20%"
                        lockAxis="y"
                    >
                        <template v-for="(point, index) in widget.feed">
                            <slick-item :index="index" :key="index">
                                <helper-fieldset class="feed pt-2" dense>
                                    <template #content>
                                        <div class="feed-title">
                                            {{ point }}
                                        </div>

                                        <div class="controls">
                                            <v-menu
                                                transition="slide-x-transition"
                                                :close-on-content-click="false"
                                                :min-width="210"
                                                bottom
                                                left
                                            >
                                                <template #activator="{ on }">
                                                    <v-icon v-on="on" dense>
                                                        mdi-square-edit-outline
                                                    </v-icon>
                                                </template>

                                                <v-layout class="widget-text__area--wrap pa-2" fill-height>
                                                    <v-flex class="widget-text__area">
                                                        <v-textarea
                                                            :label="$t('graph.text')"
                                                            v-model="widget.feed[index]"
                                                            :color="color"
                                                            ref="textarea"
                                                            hide-details
                                                            no-resize
                                                            auto-grow
                                                            flat
                                                        />

                                                        <div class="widget-textarea--tools">
                                                            <v-btn @click.stop="remove(index)" :color="color" small icon>
                                                                <v-icon :color="color">
                                                                    mdi-trash-can-outline
                                                                </v-icon>
                                                            </v-btn>
                                                        </div>
                                                    </v-flex>
                                                </v-layout>
                                            </v-menu>
                                        </div>
                                    </template>
                                </helper-fieldset>
                            </slick-item>
                        </template>
                    </slick-list>
                </template>
            </v-flex>
        </div>
    </graph-drag>
</template>

<script>
    import { VColorPickerPatched as VColorPicker } from '~/utils/v-color-picker-patch'
    import { SlickList, SlickItem } from 'vue-slicksort'

    import { fonts as list } from '~/assets/data/fonts.mjs'
    import { timezones } from '~/assets/data/timezones.mjs'
    import { channels } from '~/assets/data/rss-channels'
    import { currency } from '~/assets/data/currency.mjs'

    import { debounce } from '~/utils/common/debounce.mjs'
    import { Throttle } from '~/utils/throttle.mjs'

    const trim = s => typeof s === 'string' ? s.trim() : '',

        baseOptions = {
            processStyle: { backgroundColor: '#5181b8' },
            useKeyboard: true,
            clickable: true,
            duration: .5,
            dotSize: 10,
            width: 'auto',
            height: 4
        },

        MS = 700

    export default {
        components: {
            VueSlider: () => import(/* webpackChunkName: "slider" */ 'vue-slider-component'),

            /** @see https://github.com/mengxiong10/vue2-datepicker */
            DatePicker: () => import(/* webpackChunkName: "picker" */ 'vue2-datepicker/locale/ru')
                .then(() => import(/* webpackChunkName: "date" */ 'vue2-datepicker'))
                .then(m => m.default),

            VColorPicker,
            SlickList,
            SlickItem
        },
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        filters: {
            trim
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            widget() {
                return this.$parent.canvas._objects.find(o => o.custom.unique === this.unique)
            },
            installed() {
                const w = this.$parent.canvas._objects.filter(o => o.type === 'widget-profile')

                return {
                    uniques: w.map(o => o.custom.unique),
                    profiles: w.map(o => o.profile)
                }
            },
            geoItems() {
                return this.geoEntries.filter(g => /Россия/.test(g.subtitle))
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            unique() {
                return this.$store.state.canvas.widget
            },
            widgetJsonSid() {
                return this.widget?.sid
            },
            widgetTextFill: {
                get() {
                    return this.widget?.textFill
                },
                set(v) {
                    this.textFill.run(v)
                }
            },
            widgetFontSize: {
                get() {
                    return this.widget?.fontSize
                },
                set(v) {
                    this.fontSize.run(v)
                }
            },
            widgetLineHeight: {
                get() {
                    return this.widget?.lineHeight
                },
                set(v) {
                    this.lineHeight.run(v)
                }
            },
            widgetTextWidth: {
                get() {
                    return this.widget?.textWidth
                },
                set(v) {
                    this.textWidth.run(v)
                }
            },
            widgetCharsCount: {
                get() {
                    return this.widget?.charsCount
                },
                set(v) {
                    this.charsCount.run(v)
                }
            },
            visibleTitle: {
                get() {
                    return this.widget?.visibleTitle
                },
                set(v) {
                    this.widget.visibleTitle = v
                }
            },
            visibleContent: {
                get() {
                    return this.widget?.visibleContent
                },
                set(v) {
                    this.widget.visibleContent = v
                }
            },
            visibleDate: {
                get() {
                    return this.widget?.visibleDate
                },
                set(v) {
                    this.widget.visibleDate = v
                }
            },
            rssChannel: {
                get() {
                    return this.widget?.channel
                },
                set(v) {
                    this.channel.run(v)
                }
            },
            rssCharset: {
                get() {
                    return this.widget?.charset
                },
                set(v) {
                    this.charset.run(v)
                }
            },
            userId: {
                set(uid) {
                    uid = +uid

                    if (!Number.isNaN(uid)) {
                        this.widget.userId = uid
                    }
                },
                get() {
                    return this.widget?.userId
                }
            }
        },
        watch: {
            current: 'apply',

            timestamp(nv, ov) {
                nv || (nv = 0)

                if (ov !== null) {
                    this.widget && (this.widget.point = nv / 1000)
                }
            },
            widget(v) {
                v || (setTimeout(this.$emit.bind(this, 'tool:cancel'), 1e2))
            },
            test(v) {
                this.widget && (this.widget.info = v)
            },
            geoSearch: debounce(function(value)
            {
                value || (value = this.widget.city?.title)

                if (this.preventSearch(value)) return

                const dump = this.dumpEntries.slice()

                if (!value || value.length < 2) {
                    return this.defaultModel(dump)
                }

                if (this.geoIsLoading) return

                this.geoIsLoading = true

                this.widget.find(value)
                    .then(({ results }) => { this.geoEntries = results.length ? results : dump })
                    .catch(() => { this.defaultModel(dump) })
                    .finally(() => {
                        this.geoIsLoading = false
                    })

            }, MS)
        },
        data: () => ({
            align: ['left', 'center', 'right', 'justify'],
            info: [],
            test: [],

            timestamp: null,
            textFill: null,
            fontSize: null,
            current: null,

            force: false,

            geoIsLoading: false,
            geoSearch: null,
            oldSearch: null,
            dumpEntries: [],
            geoEntries: [],

            timezones,
            channels,
            currency,
            list,

            options:   { ...baseOptions, interval:  1, max: 120, min: 12  },
            lhOptions: { ...baseOptions, interval: .1, min:  .5, max: 2   },
            twOptions: { ...baseOptions, interval:  1, min: 200, max: 800 },
            ccOptions: { ...baseOptions, interval:  1, max: 300, min: 50  },

            datePickerOptions: {
                type: 'datetime',
                valueType: 'timestamp',
                timeTitleFormat: 'DD-MM-YYYY HH:mm',
                titleFormat: 'DD-MM-YYYY HH:mm',
                format: 'DD-MM-YYYY HH:mm'
            },
            profiles: [
                'last-subscriber',
                'last-commentor',
                'last-liker',
                'best-commentor',
                'best-reposter',
                'best-liker',
                'birthday',
                'user'
            ]
        }),
        methods: {
            trim,

            copy(prop)
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(trim(this[prop])))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            apply(current)
            {
                this.widget && (this.widget.fontFamily = current.family)
            },
            changeList({ newIndex, oldIndex })
            {
                const [item] = this.widget?.feed.splice(oldIndex, 1) || []

                this.widget?.feed.splice(newIndex, 0, item)
            },
            preventSearch(nv)
            {
                const { title } = this.geoEntries[0] || {},
                    ov = this.oldSearch

                nv && (this.oldSearch = nv)

                return nv && ((nv === title) || (ov && ov === nv))
            },
            defaultModel(dump, i = 0)
            {
                this.widget.city = dump[i]
                this.geoEntries = dump
            },
            async fetchCities()
            {
                let dumpEntries = [], geoEntries = [], geoModel = {}

                try {

                    geoEntries = await this.$store.dispatch('app/getYaGeo')
                    dumpEntries = geoEntries.slice().map(c => ({ ...c }))
                    geoModel = dumpEntries[0]

                } catch (e) {
                }

                if (this.widget.city) {
                    this.geoSearch = this.widget.city.title

                } else {
                    this.widget.city = geoModel
                }

                this.dumpEntries = dumpEntries
                this.geoEntries = geoEntries
            },
            setProfile()
            {
                const { profile, custom: { unique } = {} } = this.widget || {}

                if (this.installed.profiles.includes(profile) &&
                    !this.installed.uniques.includes(unique)) {
                    this.profiles.some(p => {
                        if (p === 'user' || !this.installed.profiles.includes(p)) {
                            this.widget.profile = p
                            return true
                        }

                        return false
                    })
                }
            },
            updateTimezone(v)
            {
                this.widget && this.widget.setTimezone(v)
            },
            updateChannel(v)
            {
                this.widget && (this.widget.channel = v)
            },
            updateProfile(v)
            {
                this.widget && (this.widget.profile = v)

                this.forceReload()
            },
            updateCurr(v)
            {
                this.widget && (this.widget.curr = v)
            },
            updateRate(v)
            {
                this.widget && (this.widget.rate = v)
            },
            lineHeightOnChange(v)
            {
                this.widget && (this.widget.lineHeight = v)
            },
            charsCountOnChange(v)
            {
                this.widget && (this.widget.charsCount = v)
            },
            textWidthOnChange(v)
            {
                this.widget && (this.widget.textWidth = v)
            },
            fillOnChange(v)
            {
                this.widget && (this.widget.textFill = v)
            },
            sizeOnChange(v)
            {
                this.widget && (this.widget.fontSize = v)
            },
            channelOnChange(v)
            {
                this.widget && (this.widget.channel = v)
            },
            charsetOnChange(v)
            {
                this.widget && (this.widget.charset = v)
            },
            remove(index)
            {
                this.widget?.feed.splice(index, 1)
            },
            add()
            {
                this.widget?.feed.push('')
            },
            forceReload()
            {
                this.force = !this.force

                this.$forceUpdate()
            }
        },
        beforeDestroy()
        {
            this.$store.commit('canvas/set', { widget: null })

            this.textFill = null
            this.fontSize = null

            this.info = []
            this.test = []
        },
        beforeMount()
        {
            this.lineHeight = Throttle.create(250, this.lineHeightOnChange)
            this.charsCount = Throttle.create(250, this.charsCountOnChange)
            this.textWidth = Throttle.create(250, this.textWidthOnChange)

            this.fontSize = Throttle.create(250, this.sizeOnChange)
            this.textFill = Throttle.create(250, this.fillOnChange)

            this.channel = Throttle.create(this.channelOnChange)
            this.charset = Throttle.create(this.charsetOnChange)
        },
        async mounted()
        {
            await new Promise(resolve => setTimeout(resolve, 7))

            try {

                this.current = list.find(f => f.family === this.widget.fontFamily)
                this.timestamp = this.widget.point * 1000

                switch (true) {
                    case this.widget.type === 'widget-countdown':
                        import(/* webpackChunkName: "date" */ 'vue2-datepicker/scss/index.scss')
                        break
                    case this.widget.type === 'widget-weather':
                        this.info = ['temp','cond','wind','pressure','humidity']
                        this.test = this.info.slice().filter(i => this.widget.info.includes(i))
                        await this.fetchCities()
                        break
                    case this.widget.type === 'widget-info':
                        this.info = ['subscribers','online','male','female']
                        this.test = this.info.slice().filter(i => this.widget.info.includes(i))
                        break
                }

            } catch (e) {
            }

            this.setProfile()
        }
    }
</script>

<!--suppress CssUnknownProperty -->
<style lang="scss" scoped>
    @import 'assets/css/classes.css';

    .fill-color-menu .color-dialog__body {
        ::v-deep .v-color-picker {
            background-color: transparent;

            .v-color-picker__canvas {
                max-width: 210px;
            }
            .v-color-picker__controls {
                padding: 15px 10px 7px;

                .v-color-picker__edit {
                    margin-top: 20px;

                    .v-color-picker__input {
                        input {
                            text-align: left;
                            padding-left: 10px;
                            margin-right: 30px;
                            margin-bottom: 0;
                        }
                        span {
                            display: none;
                        }
                    }
                }
            }
        }
        .v-btn.color-copy {
            position: absolute;
            bottom: 6px;
            right: 9px;

            height: 29px;
            min-width: unset;
            padding: 0 5px;
        }
    }
    .widget-settings {
        max-width: 210px;

        ::v-deep .v-text-field > .v-input__control > .v-input__slot {
            max-height: unset;
            user-select: none;

            .v-select__slot {
                cursor: pointer;

                .v-select__selections {
                    .v-input--selection-controls {
                        padding-top: 0;
                        margin-top: 0;
                    }
                    .compacted {
                        letter-spacing: -1px;
                        font-size: 14px;
                    }
                    input {
                        padding: 0;
                        height: 0;
                        width: 0;
                    }
                }
                .v-input .v-label {
                    top: unset;
                }
            }
        }
        .widget-popup .widget-pane {
            .btn-toolbar .toolbar-item {
                max-height: 30px;
                width: 40px;

                border-radius: 0;

                &:hover::before {
                    background-color: currentColor;
                    opacity: .2;
                }
            }
            .widget__input--textarea {
                ::v-deep .v-textarea > .v-input__control > .v-input__slot {
                    textarea {
                        overflow: hidden !important;
                        -ms-overflow-style: none;
                        scrollbar-width: none;

                        &::-webkit-scrollbar {
                            height: 0;
                            width: 0;
                        }
                    }
                }
            }
            ::v-deep .custom.add-feed.v-text-field {
                .v-input__control > .v-input__slot {
                    min-height: unset;
                    max-height: 30px;

                    user-select: none;
                    cursor: pointer;

                    fieldset {
                        padding: 0 8px;
                        top: 0;
                    }
                    .v-select__slot {
                        min-height: unset;

                        .v-select__selections {
                            .v-btn.v-btn--icon {
                                height: unset;
                                padding: 0;
                                margin: 0;
                                border-radius: 0 !important;

                                &:hover::before {
                                    background-color: currentColor;
                                    opacity: .2;
                                }
                            }
                        }
                    }
                }
            }
            ::v-deep .custom.widget-align.v-text-field {
                .v-input__control > .v-input__slot {
                    min-height: unset;
                    max-height: 40px;

                    user-select: none;
                    cursor: pointer;
                }
            }
            .feed-info {
                cursor: pointer;

                ::v-deep .v-text-field > .v-input__control > .v-input__slot {
                    min-height: unset;
                    max-height: 30px;

                    user-select: none;
                    cursor: pointer;

                    fieldset {
                        padding: 0 8px;
                        top: 0;
                    }
                    .v-select__slot {
                        min-height: unset;

                        .v-select__selections {
                            justify-content: space-between;

                            .feed-title {
                                max-width: 150px;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                overflow: hidden;
                            }
                            .controls .v-icon {
                                cursor: pointer;
                                height: 20px;
                                width: 20px;
                                margin: 2px;

                                &:hover::after {
                                    background-color: currentColor;
                                    opacity: .3;
                                }
                                .v-icon {
                                    font-size: 18px !important;
                                }
                            }
                        }
                    }
                }
            }
            ::v-deep .user-id.v-text-field--outlined.v-input--is-focused > .v-input__control > .v-input__slot fieldset {
                color: rgba(0,0,0,.38);
                border: 1px solid;
            }
            ::v-deep .visibility__item--checker.v-text-field {
                .v-input__control > .v-input__slot {
                    user-select: none;
                    cursor: pointer;

                    .v-select__slot > .v-select__selections {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            }
            .mx-datepicker {
                width: 100%;
            }
        }
    }
    .widget-text__area--wrap {
        background-color: #fff;

        .widget-text__area {
            ::v-deep .v-text-field {
                padding-top: 5px;
                margin-top: 0;

                .v-label {
                    top: 0;

                    &.v-label--active {
                        transform: translateY(-9px) scale(.75);
                    }
                }
                .v-input__control {
                    .v-input__slot:after,
                    .v-input__slot:before {
                        content: none;
                        border-color: transparent;
                        transition: none;
                        width: 0;
                    }
                }
            }
            .widget-textarea--tools {
                position: absolute;
                right: 0;
                top: 0;

                .v-btn {
                    height: 25px;
                    width: 25px;
                    margin: 2px;

                    &:hover::before {
                        background-color: currentColor;
                        opacity: .2;
                    }
                    .v-icon {
                        font-size: 18px;
                        height: 18px;
                        width: 18px;
                    }
                }
            }
        }
    }
    .cities__menu--item, .fonts__menu--item {
        line-height: 2.4;

        &.geo {
            display: flex;
            white-space: nowrap;
            flex-direction: column;
            align-items: flex-start;
            max-height: 60px;

            sub {
                font-size: 70%;
            }
        }
    }
    .ellipsisfont {
        display: block;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 210px;
    }
</style>
