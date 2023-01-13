<template>
    <v-layout justify-center fill-height key="core-connections">
        <material-card class="module connection-module connections"
            :class="{ empty: !user || !groups.length }"
            :color="color"
            elevation="2"
            offset="12"
            full-width
            ref="card"
        >
            <template #header>
                <v-layout class="connection-header" :class="themeClasses" justify-space-between>
                    <div v-if="gid && group" class="connection-header__title pa-3">
                        <v-badge offset-x="35" offset-y="8" :color="paid ? 'success' : 'error'" light bordered dot>
                            <v-avatar size="32px">
                                <v-img :src="group.photo_50 || group.photo_100 || group.photo_200" />
                            </v-avatar>
                        </v-badge>

                        <template v-if="!mobile">
                            {{ group.name | spoof(_self) }}
                        </template>
                    </div>
                    <lazy-core-hint v-else :hint="{ entity: 'core', id: 0 }" class="connection-header__title pa-3">
                        {{ $t('context.connections') }}
                    </lazy-core-hint>

                    <div v-if="gid" class="connection-header__controls">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-if="base === 'cover'" v-on="on" @click="setCommunityToken()" aria-label="add-token" icon>
                                    <v-icon dense>mdi-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.connect') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-if="base === 'cover' && multiply" v-on="on" :disabled="connection.length < 2" @click="settings = true" aria-label="settings" icon>
                                    <v-icon dense>mdi-cog</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.settings') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" @click="gid = null" aria-label="return" icon>
                                    <helper-return :fill="fill" />
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.return') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <v-layout class="connection-body"
                :class="{ ...themeClasses, mobile }"
                :align-center="!list.length"
                :fill-height="!list.length"
                justify-center
                column
            >
                <template v-if="!user">
                    <v-list>
                        <v-list-item :ripple="false">
                            <v-list-item-title class="text-center disabled--text">
                                {{ $t('common.needed') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </template>
                <template v-else-if="gid && list.length">
                    <v-list>
                        <template v-for="item in list">
                            <v-list-item @click.stop="" :key="item._id" :color="color" :ripple="false">
                                <v-checkbox
                                    @change="setConnection(item._id)"
                                    :label="`${item.name}`"
                                    :input-value="connection"
                                    :multiple="multiply"
                                    :value="item._id"
                                    :ripple="false"
                                    :color="color"
                                    hide-details
                                />
                            </v-list-item>
                        </template>
                    </v-list>
                </template>
                <template v-else-if="!list.length">
                    <v-list>
                        <v-list-item :class="{ divider: false }" :ripple="false">
                            <v-list-item-title class="disabled--text text-center">
                                {{ $t(`${base}.list_empty`) }}
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="goto" class="goto-btn" :ripple="false">
                            <v-list-item-title class="text-center disabled--text">
                                <v-icon :color="color">mdi-chevron-left</v-icon> {{ $t('chatbot.goto') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </template>
                <template v-else-if="groups.length">
                    <template v-for="item in groups">
                        <v-flex @click="choose(item)" class="group-list-item" :key="item.id" d-flex>
                            <v-badge offset-x="59" offset-y="13" :color="item.paid[base] ? 'success' : 'error'" dot>
                                <v-list-item-avatar :key="item.id">
                                    <v-img :src="item.photo_200 || item.photo_100 || item.photo_50" />
                                </v-list-item-avatar>
                            </v-badge>

                            <h3 :class="`${item.id} ${item.token ? color : 'disabled'}--text`">
                                {{ item.name | spoof(_self) }}
                            </h3>
                        </v-flex>
                    </template>
                </template>
                <template v-else-if="nocommunity">
                    <v-list>
                        <v-list-item :ripple="false">
                            <v-list-item-title class="text-center disabled--text">
                                {{ $t('common.nocommunity') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </template>
            </v-layout>
        </material-card>

        <v-dialog v-if="base === 'cover'" v-model="settings" :max-width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <v-card class="cover-dialog" :class="{ fullscreen: mobile }" elevation="0">
                <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="#fff" />

                <template v-if="mobile && $store.state.app.vkapp">
                    <v-layout class="cover-dialog__btn-wrapper" justify-start>
                        <v-btn @click="settings = false" aria-label="close" icon>
                            <v-icon>mdi-window-close</v-icon>
                        </v-btn>
                        <v-btn @click="timeRangeApply" aria-label="apply" icon>
                            <v-icon>mdi-check</v-icon>
                        </v-btn>
                    </v-layout>
                </template>
                <template v-else>
                    <v-tabs :color="color" class="cover-dialog__tabs-header" height="60px" hide-slider show-arrows grow>
                        <v-tab @click="settings = false" :ripple="false">
                            <v-icon :color="color">mdi-window-close</v-icon>
                        </v-tab>
                        <v-tab @click="timeRangeApply" :ripple="false">
                            <v-icon :color="color">mdi-check</v-icon>
                        </v-tab>
                    </v-tabs>
                </template>

                <v-card-text class="cover-dialog__pane" id="auto-dropdown-containter" :key="rangesReload">
                    <v-layout column>
                        <template v-for="(r, i) in timeRangeSettings">
                            <v-flex :key="i">
                                <fieldset>
                                    <legend>{{ r.name }}</legend>

                                    <label>{{ $t('cover.from') }}</label>
                                    <vue-timepicker v-model="r.from"
                                        @change="changeHandler($event, r, i, 'from')"
                                        container-id="auto-dropdown-containter"
                                        drop-direction="auto"
                                        lazy
                                    />

                                    <label>{{ $t('cover.to') }}</label>
                                    <vue-timepicker v-model="r.to"
                                        @change="changeHandler($event, r, i, 'to')"
                                        container-id="auto-dropdown-containter"
                                        drop-direction="auto"
                                        lazy
                                    />
                                </fieldset>
                            </v-flex>
                        </template>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="authorize" :width="mobile ? '100%' : '400px'" :fullscreen="mobile">
            <lazy-core-vk-transition
                v-if="group"
                :group="group"
                :action="transition"
                :fullscreen="mobile"
                @close="authorize = false"
            />
        </v-dialog>

        <v-dialog v-model="tariff" :width="mobile ? '100%' : '540px'" :fullscreen="mobile">
            <lazy-core-paid-dialogue :entity="base" @close="tariff = false" />
        </v-dialog>
    </v-layout>
</template>

<script>
    import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'
    import cloneDeep from 'lodash/cloneDeep'

    import { community, error } from '~/mixins/common'
    import { debounce } from '~/utils/common/debounce.mjs'
    import { spoof } from '~/utils/common/spoof.mjs'

    import { exclude, include, tostamp, getRange } from '~/utils/cover'
    import { zoomPan } from '~/utils/renderer.mjs'

    export default {
        components: { VueTimepicker },

        mixins: [error, community],

        filters: {
            spoof
        },
        props: {
            multiply: {
                type: Boolean,
                default: false
            },
            base: {
                type: String,
                required: true
            }
        },
        computed: {
            themeClasses() {
                return { [`theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`]: true }
            },
            color() {
                return this.$vuetify.theme.dark ? 'accent' : this.$store.state.app.color
            },
            fill() {
                return this.$vuetify.theme.dark ? '#7a7a7a' : '#fff'
            },
            group() {
                return this.groups.find(g => g.id === (this.gid || this.xid))
            },
            nocommunity() {
                return this.$store.state.app.user && !this.groups.length
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            timeRangeSettings()
            {
                const { multiply, list, connection, gid, base } = this,
                    { ranges } = this.$store.state[base]

                return gid && multiply
                    ? list.map(c => getRange(c, connection, ranges[gid])).filter(Boolean)
                    : []
            },
            list: {
                set(list) {
                    this.$store.commit(`${this.base}/set`, { list })
                },
                get() {
                    return this.$store.state[this.base].list
                }
            }
        },
        watch: {
            gid: 'reload',

            connection: {
                deep: true,
                handler(nv, ov) {
                    this.multiply ? this.multipleConnect(nv, ov) : this.singleConnect(nv, ov)
                }
            },
            list: {
                handler: 'reload',
                deep: true
            }
        },
        data() {
            const connection = this.multiply ? [] : null,
                installed = this.multiply ? [] : null

            return {
                discard: () => {},

                rangesReload: false,
                authorize: false,
                settings: false,

                reloaded: false,
                tariff: false,
                paid: false,

                connection,
                installed,

                xid: null,
                gid: null,

                details: {
                    route: this.base,
                    action: 'setCommunityToken',
                    entity: 'connections',
                    params: null
                }
            }
        },
        methods: {
            changeHandler({ data: { HH, mm } }, cover, i, key)
            {
                let ranges = cloneDeep((this.$store.state[this.base].ranges || {}))

                ranges[this.gid] || (ranges[this.gid] = [])
                ranges[this.gid][i] || (ranges[this.gid][i] = cover)

                if (HH !== '' && mm !== '') {
                    ranges[this.gid][i][key] = { HH, mm }

                } else {
                    delete ranges[this.gid][i]
                }

                ranges[this.gid] = ranges[this.gid].filter(Boolean)

                this.$store.commit(`${this.base}/set`, { ranges })
            },
            async timeRangeApply()
            {
                let error, data, ranges = this.$store.state[this.base].ranges || {}

                try {

                    ({ data, error } = await this.$axios.post('/cover/timerange', {
                        gid: this.gid,

                        covers: ranges[this.gid]?.map(c => (c.from && c.to && {
                            from: tostamp(c.from.HH, c.from.mm),
                            to: tostamp(c.to.HH, c.to.mm),
                            _id: c._id
                        }))
                            .filter(Boolean)
                    }))

                    error = data?.error || error

                } catch (e) {
                    error = e.message
                }

                if (error) {
                    return this.$bus.$emit('snack', { content: error, color: 'error', raw: true })
                }
                if (data.set) {
                    this.$bus.$emit('snack', { content: 'common.saved', color: 'success' })
                    this.$store.dispatch('cover/coversLoad').then(() => {
                        this.rangesReload = !this.rangesReload
                    })
                }
            },
            choose({ id, token })
            {
                if (!token) {
                    if (!this.accessAdminLevel(id)) return

                    this.xid = this.details.params = id

                    this.vkapp ? this.setCommunityToken(id) : (this.authorize = true)

                } else {
                    const { paid } = this.groups.find(g => g.id === id) || {}

                    this.reloaded = true
                    this.paid = !!paid[this.base]
                    this.gid = id
                }
            },
            reload()
            {
                const connections = []

                this.list.some(d => {
                    if ((d.connections || []).includes(this.gid)) {
                        if (!this.multiply) {
                            this.installed = this.connection = d._id

                        } else {
                            connections.push(d._id)
                        }

                        return !this.multiply
                    }

                    return false
                })

                if (this.multiply) {
                    this.installed = this.connection = [
                        ...new Set(connections)
                    ]
                }

                this.$emit('update')
            },
            setConnection: debounce(function(conn)
            {
                switch (this.base) {
                    case 'cover':
                        if (this.paid) {
                            this.connection = this.connection.includes(conn)
                                ? this.connection.filter(c => c !== conn)
                                : [...this.connection, conn]

                        } else {
                            this.connection = this.connection.slice()
                        }

                        break
                    case 'chatbot':
                        if (this.paid) {
                            this.connection = conn === this.connection
                                ? null
                                : conn

                        } else {
                            this.connection = this.connection
                                ? `${this.connection}`
                                : null
                        }
                }

                if (!this.paid) this.tariff = true
            }),
            multipleConnect(nv, ov)
            {
                if (this.reloaded) return this.reloaded = false

                if (!this.paid) return this.reloaded = true

                if (this.connection.join('') === this.installed.join('')) return

                let _include = include(nv, ov),
                    _exclude = exclude(nv, ov),

                    action

                switch (true) {
                    case !!_include.length && !_exclude.length:
                        action = 'connection'
                        break
                    case !_include.length && !!_exclude.length:
                        action = 'disconnection'
                        break
                }

                this.$store.commit(`${this.base}/setMultiplyConnection`, {
                    entity: this.base,
                    set: _include[0],
                    del: _exclude[0],
                    gid: this.gid
                })

                this.$bus.$emit('snack', {
                    content: `${this.base}.${action}`,
                    color: 'success'
                })
            },
            singleConnect(nv, ov)
            {
                if (!this.paid) return this.connection = ov

                if (this.connection === this.installed) return

                let action, { connection: set, installed: del } = this

                switch (true) {
                    case !!this.installed && !!this.connection:
                        this.installed = this.connection
                        action = 'switched'
                        break

                    case !this.installed && !!this.connection:
                        this.installed = this.connection
                        action = 'connection'
                        break

                    case !!this.installed && !this.connection:
                        action = 'disconnection'
                        this.installed = null
                        break
                }

                this.$store.commit(`${this.base}/setSingleConnection`, { entity: this.base, gid: this.gid, set, del })

                this.$bus.$emit('snack', { content: `${this.base}.${action}`, color: 'success' })
            },
            transition()
            {
                this.$ls.set('doit', this.details)
            },
            goto()
            {
                this.$store.commit(`${this.base}/set`, { entity: this.base === 'chatbot' ? 'dialogs' : 'list' })
            }
        },
        beforeDestroy()
        {
            this.discard()
        },
        async mounted()
        {
            const doit = await this.$ls.get('doit')

            if (doit && doit.action) {
                this[doit.action](doit.params)
                this.$ls.set('doit', null)
            }

            this.$emit('update')

            this.$nextTick(() => { try {
                this.discard = zoomPan(this.$refs.card.$el)
            } catch (e) {
            } })
        }
    }
</script>

<style lang="scss" scoped>
    .v-card.module.connection-module {
        .connection-header {
            align-items: center;
            min-height: 55px;

            .connection-header__title {
                font-size: 16px;

                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;

                ::v-deep .v-avatar {
                    margin-right: 5px;
                }
            }
            .connection-header__controls {
                display: flex;
                flex-wrap: wrap;
                font-weight: 500;
                padding: 0 7px;

                ::v-deep .v-btn.v-btn--icon {
                    height: 41px;
                    width: 41px;
                    margin: 0;

                    &:hover::before {
                        background-color: currentColor;
                        opacity: .3;
                    }
                    .v-icon {
                        font-size: 20px;
                    }
                }
            }
        }
        .connection-body {
            .group-list-item {
                position: relative;
                align-items: center;
                cursor: pointer;

                will-change: opacify;
                color: #7a7a7a;

                &:before {
                    display: block;
                    content: '';

                    position: absolute;
                    left: 0;
                    top: 0;

                    height: 100%;
                    width: 100%;
                    padding: 0;
                    margin: 0;

                    background-color: currentColor;
                    opacity: 0;

                    transition: opacity .3s;
                }
                &:hover::before {
                    opacity: .1;
                }
            }
            ::v-deep .v-list {
                .v-list-item {
                    .v-input--selection-controls {
                        margin-top: unset;
                    }
                    .goto-btn .v-list-item__title {
                        cursor: pointer;
                    }
                }
            }
            &.theme--dark {
                ::v-deep .v-list .v-list-item {
                    .v-list-item__title,
                    .v-label,
                    .v-icon {
                        color: #7a7a7a !important;
                    }
                }
            }
            &.mobile .v-list-item__avatar {
                margin: 8px 16px 8px 0;
            }
        }
        &.theme--dark {
            .connection-header {
                color: #7a7a7a;

                .v-btn.v-btn--icon {
                    color: #7a7a7a;
                }
            }
        }
        ::v-deep .v-card__text {
            height: 100%;
        }
        ::v-deep .v-card__actions .layout {
            flex-wrap: wrap;
        }
    }
    .cover-dialog {
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            .cover-dialog__pane {
                max-height: calc(100vh - 86px);
            }
        }
        .cover-dialog__btn-wrapper {
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
        .cover-dialog__tabs-header {
            flex: 0 1 auto;
            border-bottom: 1px solid #e3e4e8;

            ::v-deep .v-tabs__div {
                transition: background-color .4s;

                &:hover {
                    background-color: rgba(70,70,70,.1);
                }
            }
        }
        .cover-dialog__pane {
            padding: 20px !important;
            min-height: 280px;

            .flex {
                padding: 5px 0;

                &:first-child {
                    padding-top: 0;
                }

                fieldset {
                    border: 2px solid #aaa;
                    border-radius: 5px;

                    span.time-picker {
                        margin: 5px;
                    }
                    legend {
                        padding: 0 7px;
                    }
                }
            }
        }
    }
</style>
