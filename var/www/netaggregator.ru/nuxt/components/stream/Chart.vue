<template>
    <v-layout justify-center fill-height>
        <material-card class="module stream-module chart"
            :class="{ empty: !marksAreSet }"
            :color="color"
            elevation="2"
            offset="12"
            full-width
            ref="card"
        >
            <template #header>
                <v-layout class="stream-header" justify-space-between wrap>
                    <lazy-core-hint :hint="{ entity: 'stream', id: 2 }" class="stream-header__title pa-3">
                        {{ $t('stream.statistics') }}
                    </lazy-core-hint>

                    <div class="stream-header__controls">
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" :disabled="!user" @click="typeSwitcher = !typeSwitcher" aria-label="toggle" icon>
                                    <v-icon dense>{{ typeSwitcher ? 'mdi-chart-bar' : 'mdi-chart-line' }}</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.chart') }}</span>
                        </v-tooltip>
                        <v-tooltip :disabled="mobile" nudge-bottom="40">
                            <template #activator="{ on }">
                                <v-btn v-on="on" :disabled="!user" @click="reset" aria-label="reset" icon>
                                    <v-icon dense>mdi-sync</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('tooltip.reload') }}</span>
                        </v-tooltip>
                    </div>
                </v-layout>
            </template>

            <div v-if="marksAreSet" class="chart-wrapper">
                <helper-error-boundary>
                    <!--<lazy-component :is="plotly" :data="data" :layout="layout" v-bind="config" />-->
                    <lazy-component :is="apex" :options="config" :series="data" ref="apex" />
                </helper-error-boundary>
            </div>
            <v-list v-else-if="user">
                <v-list-item :class="{ divider: false }" :ripple="false">
                    <v-list-item-title class="disabled--text">
                        {{ $t('stream.empty') }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
            <v-list v-else>
                <v-list-item :class="{ divider: false }" :ripple="false">
                    <v-list-item-title class="disabled--text">
                        {{ $t('common.needed') }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </material-card>
    </v-layout>
</template>

<script>
    // import * as ru from 'plotly.js/lib/locales/ru.js'

    import { nextFrame, cancelFrame } from '~/utils/callbacks.mjs'
    import { zoomPan } from '~/utils/renderer.mjs'
    import colors from '~/assets/data/palette.js'

    /* const config = {
        displayModeBar: true,
        displaylogo: false,
        scrollZoom: true,
        locales: { ru },

        // toImageButtonOptions: {
        //     format: 'jpeg'
        // },
        modeBarButtonsToRemove: [
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            'toggleSpikelines',
            'select2d',
            'lasso2d',
            'toImage'
        ]
    },

    margin = {
        b: 40,
        l: 40,
        t: 20,
        r: 10
    } */

    export default {
        computed: {
            typeSwitcher: {
                set(v) {
                    this.$store.commit('socket/set', { chart: v ? 'line' : 'bar' })
                },
                get() {
                    return this.$store.state.socket.chart === 'line'
                }
            },
            apex() {
                return () => import(/* webpackChunkName: "vue-apexcharts" */ 'vue-apexcharts').then(m => m.default || m)
            },
            /* layout() {
                return this.typeSwitcher ? this.line.layout : this.bar.layout
            }, */
            config() {
                return this.typeSwitcher ? this.line : this.bar
            },
            data() {
                return this.typeSwitcher ? this.line.series : this.bar.series
            },
            marksAreSet() {
                return this.started && this.settings.marks?.length
            },
            settings() {
                return this.$store.state.socket.settings || {}
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            user() {
                return this.$store.state.app.user
            },
            /* plotly() { plotly.js@^2.5.1 vue-plotly@^1.1.0
                return () => import(/* webpackChunkName: "plotly" *!/ 'vue-plotly')
                    .then(m => m.Plotly || m)
                    .then(this.reAssign)
            },
            modebar() {
                return {
                    bgcolor: 'transparent',
                    activecolor: this.$vuetify.theme.dark ? 'white' : 'black',
                    color: '#7a7a7a'
                }
            },
            line() {
                let { modebar, settings, $store } = this,
                    c = colors.slice(),
                    data = []

                try {

                    settings.stats || (settings.stats = [])
                    settings.chart || (settings.chart = {})
                    settings.chart.dataset || (settings.chart.dataset = {})

                    data = Object.entries(settings.chart.dataset).map(([tag, set]) => ({
                        x: settings.chart.labels?.map(ts => new Date(ts)),
                        y: set,

                        name: settings.stats.find(s => s.tag === tag)?.mark,
                        mode: 'lines+markers',
                        line: {
                            color: c.splice(0, 1)[0],
                            shape: 'spline',
                            width: 3
                        }
                    }))

                } catch (e) {
                }

                return {
                    data,
                    config: {
                        ...config,
                        responsive: this.started,
                        locale: $store.state.app.locale || 'ru'
                    },
                    layout: {
                        xaxis: {
                            // rangeslider: {}
                        },
                        yaxis: {
                            fixedrange: true
                        },
                        legend: {
                            orientation: 'h'
                        },

                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        showlegend: true,
                        modebar,
                        margin
                    }
                }
            },
            bar() {
                let { modebar, settings, $store } = this,
                    data = []

                try {

                    settings.stats || (settings.stats = [])

                    data = [{
                        marker: { color: colors.slice(0, settings.stats.length) },
                        x: settings.stats.map(s => s.mark),
                        y: settings.stats.map(s => s.count),
                        type: 'bar'
                    }]

                } catch (e) {
                }

                return {
                    data,
                    config: {
                        ...config,
                        scrollZoom: false,
                        responsive: this.started,
                        locale: $store.state.app.locale || 'ru',

                        modeBarButtonsToRemove: [
                            ...config.modeBarButtonsToRemove,
                            'autoScale2d',
                            'zoomOut2d',
                            'zoomIn2d',
                            'zoom2d',
                            'pan2d'
                        ]
                    },
                    layout: {
                        xaxis: {
                            fixedrange: true
                        },
                        yaxis: {
                            fixedrange: true
                        },

                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        showlegend: false,
                        modebar,
                        margin
                    }
                }
            } */
            line()
            {
                if (!this.typeSwitcher) return {}

                let { settings, $store } = this,
                    series = [],
                    xaxis = {}

                try {

                    settings.stats || (settings.stats = [])
                    settings.chart || (settings.chart = {})
                    settings.chart.dataset || (settings.chart.dataset = {})

                    xaxis = {
                        categories: settings.chart.labels?.map(ts => (new Date(ts)).toLocaleDateString()) || [],
                        labels: { show: false }
                    }
                    series = Object.entries(settings.chart.dataset).map(([tag, set]) => ({
                        name: settings.stats.find(s => s.tag === tag)?.mark,
                        data: set
                    }))

                } catch (e) {
                }

                return {
                    colors: colors.slice(),
                    series,
                    xaxis,
                    stroke: {
                        curve: 'smooth',
                        width: 2
                    },
                    chart: {
                        // redrawOnWindowResize: true,
                        background: 'transparent',
                        type: 'line',
                        toolbar: {
                            show: true,
                            tools: {
                                download: false
                            }
                        },
                        animations: {
                            enabled: false
                        }
                    },
                    theme: {
                        mode: $store.state.app.theme
                    }
                }
            },
            bar()
            {
                if (this.typeSwitcher) return {}

                let { settings, $store } = this,
                    c = colors.slice(),

                    series = [],
                    xaxis = {}

                try {

                    settings.stats || (settings.stats = [])
                    xaxis = { categories: settings.stats.map(s => s.mark) }
                    series = [{ data: settings.stats.map(s => s.count) }]

                } catch (e) {
                }

                return {
                    colors: [({ dataPointIndex }) => c[dataPointIndex]],
                    series,
                    xaxis,
                    chart: {
                        redrawOnWindowResize: true,
                        background: 'transparent',
                        type: 'bar',
                        toolbar: {
                            show: true,
                            tools: {
                                download: false
                            }
                        },
                        zoom: {
                            enabled: false
                        },
                        animations: {
                            enabled: false
                        }
                    },
                    theme: {
                        mode: $store.state.app.theme
                    }
                }
            }
        },
        watch: {
            // '$store.state.app.locale': 'reRender',
            '$store.state.app.theme': 'reRender',

            typeSwitcher: 'reRender',
            settings: 'reRender'
        },
        data: () => ({
            discard: () => {},

            started: false,
            startid: null,

            // redraw: false,
            drawid: null
        }),
        methods: {
            reset()
            {
                this.$axios.$post('/stream/reset', this.$BROWSER.NATIVE_APP ? { uid: this.$store.state.app.user?.id } : {})
                    .then(({ clear }) => clear && this.$bus.$emit('snack', { content: 'stream.cleared', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'chart.error', color: 'error' }))
                    .finally(() => {
                        this.$store.commit('socket/clearStats')
                        this.reRender()
                    })
            },
            /* reAssign(plotly)
            {
                if (plotly && typeof plotly.methods.onResize === 'function') {
                    plotly.methods.onResize = (function(onResize) {
                        return function() {
                            nextFrame(() => {
                                if (this.$el.isConnected) {
                                    onResize.call(this)
                                }
                            })
                        }
                    })(plotly.methods.onResize)
                }

                return plotly
            }, */
            reRender()
            {
                if (!this.marksAreSet) return

                this.drawid && clearTimeout(this.drawid)
                this.drawid = setTimeout(() => {
                    // this.redraw = !this.redraw
                    this.$refs.apex?.refresh()
                })
            }
        },
        beforeDestroy()
        {
            this.$refs.apex?.destroy()

            this.$bus.$off('settings:reload', this.reRender)

            this.started = false

            this.discard()
        },
        mounted()
        {
            this.$bus.$on('settings:reload', this.reRender)

            this.startid && cancelFrame(this.startid)

            this.startid = nextFrame(() => { try {
                this.discard = zoomPan(this.$refs.card.$el)
                this.started = true

            } catch (e) {
            } })
        }
    }
</script>

<style lang="scss" scoped>
    .stream-module {
        .stream-header {
            align-items: center;
            height: 55px;

            .stream-header__title {
                font-size: 16px;
            }
            .stream-header__controls {
                display: flex;
                flex-wrap: wrap;
                font-weight: 500;
                padding: 0 7px;

                align-items: center;

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
        &.theme--dark {
            .stream-header {
                color: #7a7a7a;

                .v-btn.v-btn--icon {
                    color: #7a7a7a;
                }
            }
            .v-card__text .v-list {
                .v-list-item {
                    color: #7a7a7a !important;
                }
            }
        }
        ::v-deep .v-card__text {
            height: 100%;
            padding: 0;

            .chart-wrapper {
                padding: 20px 10px;
                min-height: 400px; // 490
                height: 100%;
                width: 100%;

                canvas {
                    height: 100% !important;
                }
            }
        }
        ::v-deep .v-btn:hover::before {
            background-color: currentColor;
        }
    }
</style>
