<template>
    <v-dialog-patched
        v-model="show"
        @leave="leave"
        @before-leave="beforeLeave"
        @after-enter="afterEnter"
        content-class="covid__tracker--dialog"
        :fullscreen="fullscreen"
        :scrollable="!loading"
        :duration="1000"
        transition="slideY"
        max-width="70%"
    >
        <template #default="dialog">
            <v-card>
                <v-toolbar :color="color" dark flat>
                    <v-toolbar-title>COVID Tracker</v-toolbar-title>

                    <v-spacer />

                    <v-toolbar-items>
                        <v-btn @click="dialog.value = false" elevation="0" icon>
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" lg="4" md="6" sm="12">
                                <v-card class="box">
                                    <div class="country-select">
                                        <v-combobox
                                            @change="selectCountry"
                                            :value="selectedCountry"
                                            placeholder="Cities"
                                            :item-color="color"
                                            :color="color"
                                            :items="countries"
                                            item-text="Country"
                                            item-value="Slug"
                                            return-object
                                            hide-details
                                            outlined
                                        />
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" lg="4" md="4" sm="12">
                                <v-card class="box">
                                    <div class="count count-confirmed">
                                        <div class="count-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                                                <path fill="red" d="M21 11h-.17c-1.053 0-1.958-.669-2.357-1.644l-.021-.049c-.408-.977-.249-2.097.5-2.846l.119-.119a.999.999 0 1 0-1.414-1.414l-.119.119c-.749.749-1.869.908-2.846.5l-.049-.021C13.669 5.128 13 4.218 13 3.165v-.081C13 2.447 12.553 2 12 2s-1 .447-1 1v.036c0 1.096-.66 2.084-1.673 2.503l-.006.003a2.71 2.71 0 0 1-2.953-.588l-.025-.025a.999.999 0 1 0-1.414 1.414l.036.036a2.69 2.69 0 0 1 .583 2.929l-.027.064A2.638 2.638 0 0 1 3.085 11h-.001C2.447 11 2 11.447 2 12s.447 1 1 1h.068a2.66 2.66 0 0 1 2.459 1.644l.021.049a2.69 2.69 0 0 1-.583 2.929l-.036.036a.999.999 0 1 0 1.414 1.414l.036-.036a2.689 2.689 0 0 1 2.929-.583l.143.06A2.505 2.505 0 0 1 11 20.83v.085c0 .638.447 1.085 1 1.085s1-.448 1-1v-.17c0-1.015.611-1.93 1.55-2.318l.252-.104a2.508 2.508 0 0 1 2.736.545l.119.119a.999.999 0 1 0 1.414-1.414l-.119-.119c-.749-.749-.908-1.869-.5-2.846l.021-.049c.399-.975 1.309-1.644 2.362-1.644h.08c.638 0 1.085-.447 1.085-1s-.447-1-1-1zM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4.5a2 2 0 1 1 .001-4.001A2 2 0 0 1 14 12z" />
                                            </svg>
                                        </div>

                                        <div class="count-info">
                                            <h5 id="confirmed-total">{{ totalConfirmed }}</h5>
                                            <span>{{ $t('covid.confirmed') }}</span>
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>

                            <v-col cols="12" lg="4" md="4" sm="12">
                                <v-card class="box">
                                    <div class="count count-recovered">
                                        <div class="count-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                                                <path fill="green" d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm3.493-13a1.494 1.494 0 1 1-.001 2.987A1.494 1.494 0 0 1 15.493 9zm-4.301 6.919a4.108 4.108 0 0 0 1.616 0c.253-.052.505-.131.75-.233.234-.1.464-.224.679-.368.208-.142.407-.306.591-.489.183-.182.347-.381.489-.592l1.658 1.117a6.027 6.027 0 0 1-1.619 1.621 6.003 6.003 0 0 1-2.149.904 6.116 6.116 0 0 1-2.414-.001 5.919 5.919 0 0 1-2.148-.903 6.078 6.078 0 0 1-1.621-1.622l1.658-1.117c.143.211.307.41.488.59a3.988 3.988 0 0 0 2.022 1.093zM8.5 9a1.5 1.5 0 1 1-.001 3.001A1.5 1.5 0 0 1 8.5 9z" />
                                            </svg>
                                        </div>

                                        <div class="count-info">
                                            <h5 id="recovered-total">{{ totalRecovered || '0' }}</h5>
                                            <span>{{ $t('covid.recovered') }}</span>
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>

                            <v-col cols="12" lg="4" md="4" sm="12">
                                <v-card class="box">
                                    <div class="count count-death">
                                        <div class="count-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                                                <path fill="#373c43" d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-5 8.5a1.5 1.5 0 1 1 3.001.001A1.5 1.5 0 0 1 7 10.5zM8 17s1-3 4-3 4 3 4 3H8zm7.493-5.014a1.494 1.494 0 1 1 .001-2.987 1.494 1.494 0 0 1-.001 2.987z" />
                                            </svg>
                                        </div>

                                        <div class="count-info">
                                            <h5 id="death-total">{{ totalDeaths }}</h5>
                                            <span>{{ $t('covid.deaths') }}</span>
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" lg="6" md="12">
                                <v-card class="box">
                                    <div class="box-header">{{ $t('covid.all_times') }}</div>
                                    <div class="box-body">
                                        <lazy-component :is="apex" :options="allTimesOptions" :series="allTimesSeries" />
                                    </div>
                                </v-card>
                            </v-col>

                            <v-col cols="12" lg="6" md="12">
                                <v-card class="box">
                                    <div class="box-header">{{ $t('covid.last_30_days') }}</div>
                                    <div class="box-body">
                                        <lazy-component :is="apex" :options="daysOptions" :series="daysSeries" />
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" lg="6" md="12">
                                <v-card class="box">
                                    <div class="box-header">{{ $t('covid.recovery_rate') }}</div>
                                    <div class="box-body">
                                        <lazy-component :is="apex" :options="recoveryRateOptions" :series="recoveryRateSeries" />
                                    </div>
                                </v-card>
                            </v-col>

                            <v-col cols="12" lg="6" md="12">
                                <v-card class="box">
                                    <div class="box-header">{{ $t('covid.affected') }}</div>

                                    <div class="box-body">
                                        <table class="table-countries">
                                            <thead>
                                                <tr>
                                                    <th>{{ $t('covid.country') }}</th>
                                                    <th>{{ $t('covid.confirmed') }}</th>
                                                    <th>{{ $t('covid.recovered') }}</th>
                                                    <th>{{ $t('covid.deaths') }}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="top in topAffected" :key="top.Country">
                                                    <td>{{ top.Country }}</td>
                                                    <td>{{ top.TotalConfirmed }}</td>
                                                    <td>{{ top.TotalRecovered }}</td>
                                                    <td>{{ top.TotalDeaths }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-row v-cloak>
                            <v-col v-if="show" cols="12" lg="6" md="6" sm="12">
                                <v-card class="box">
                                    <div class="box-header">{{ $t('covid.questions_and_answers') }}</div>

                                    <div class="box-body">
                                        <lite-youtube videoid="l668ASCxnkY" params="modestbranding=2&rel=0&enablejsapi=1" />
                                    </div>
                                </v-card>
                            </v-col>

                            <v-col v-if="show" cols="12" lg="6" md="6" sm="12">
                                <v-card class="box">
                                    <div class="box-header">{{ $t('covid.how_to_protect') }}</div>

                                    <div class="box-body">
                                        <lite-youtube videoid="3rQQtgE3WtE" params="modestbranding=2&rel=0&enablejsapi=1" />
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>

                    <div class="footer">
                        <a href="https://covid19api.com" target="_blank" rel="noopener noreferrer">
                            covid19api.com
                        </a>
                    </div>

                    <div v-show="loading" class="loader">
                        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24">
                            <path fill="red" d="M21 11h-.17c-1.053 0-1.958-.669-2.357-1.644l-.021-.049c-.408-.977-.249-2.097.5-2.846l.119-.119a.999.999 0 1 0-1.414-1.414l-.119.119c-.749.749-1.869.908-2.846.5l-.049-.021C13.669 5.128 13 4.218 13 3.165v-.081C13 2.447 12.553 2 12 2s-1 .447-1 1v.036c0 1.096-.66 2.084-1.673 2.503l-.006.003a2.71 2.71 0 0 1-2.953-.588l-.025-.025a.999.999 0 1 0-1.414 1.414l.036.036a2.69 2.69 0 0 1 .583 2.929l-.027.064A2.638 2.638 0 0 1 3.085 11h-.001C2.447 11 2 11.447 2 12s.447 1 1 1h.068a2.66 2.66 0 0 1 2.459 1.644l.021.049a2.69 2.69 0 0 1-.583 2.929l-.036.036a.999.999 0 1 0 1.414 1.414l.036-.036a2.689 2.689 0 0 1 2.929-.583l.143.06A2.505 2.505 0 0 1 11 20.83v.085c0 .638.447 1.085 1 1.085s1-.448 1-1v-.17c0-1.015.611-1.93 1.55-2.318l.252-.104a2.508 2.508 0 0 1 2.736.545l.119.119a.999.999 0 1 0 1.414-1.414l-.119-.119c-.749-.749-.908-1.869-.5-2.846l.021-.049c.399-.975 1.309-1.644 2.362-1.644h.08c.638 0 1.085-.447 1.085-1s-.447-1-1-1zM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1-4.5a2 2 0 1 1 .001-4.001A2 2 0 0 1 14 12z" />
                        </svg>
                    </div>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog-patched>
</template>

<script>
    import { VDialogPatched } from '~/utils/v-dialog-patch'
    import { covidApi } from '~/utils/covid-api'

    const CASE_STATUS = { confirmed: 'confirmed', recovered: 'recovered', deaths: 'deaths' }
    const COLORS = { confirmed: '#ff0000', recovered: '#008000', deaths: '#373c43' }
    const options = {
        colors: [COLORS.confirmed, COLORS.recovered, COLORS.deaths],
        series: [],
        xaxis: {
            categories: [],
            labels: {
                show: false
            }
        },
        stroke: {
            curve: 'smooth'
        },
        grid: {
            show: false
        },
        chart: {
            redrawOnWindowResize: true,
            type: 'line',
            toolbar: {
                show: true,
                tools: {
                    download: false
                }
            }
        }
    }

    const numberWithCommas = x => (x || '0').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const extractData = countryData => countryData.map(e => e.Cases)

    function extractWorldData(worldData, status)
    {
        return worldData.map(e => {
            switch (status) {
                case CASE_STATUS.confirmed: return e.TotalConfirmed
                case CASE_STATUS.recovered: return e.TotalRecovered
            }

            return e.TotalDeaths
        })
    }

    export default {
        components: {
            VDialogPatched
        },
        props: {
            value: {
                type: Boolean,
                default: false
            }
        },
        model: {
            event: 'input',
            prop: 'value'
        },
        computed: {
            apex() {
                return () => import(/* webpackChunkName: "vue-apexcharts" */ 'vue-apexcharts').then(m => m.default || m)
            },
            color() {
                return this.$store.state.app.color
            },
            show: {
                set(value) {
                    this.$emit('input', value)
                },
                get() {
                    return this.value
                }
            }
        },
        watch: {
            value(v) {
                v && (this.loading = v) && this.init()
            }
        },
        data: () => ({
            fullscreen: false,
            loading: false,
            active: false,

            selectedCountry: 'Global',

            totalConfirmed: '123,456,789',
            totalRecovered: '123,456,789',
            totalDeaths:    '123,456,789',

            recoveryRateSeries: [],
            allTimesSeries: [],
            daysSeries: [],

            topAffected: [],
            countriesList: [],
            countries: [],

            cache: {
                summary: [],
                allTimes: [],
                days: []
            },

            recoveryRateOptions: {
                colors: [COLORS.recovered],
                labels: ['Recovery rate'],
                series: [],
                chart: {
                    redrawOnWindowResize: true,
                    type: 'radialBar',
                    toolbar: {
                        show: true,
                        tools: {
                            download: false
                        }
                    }
                }
            },
            allTimesOptions: {
                ...options
            },
            daysOptions: {
                ...options
            }
        }),
        methods: {
            afterEnter()
            {
                setTimeout(() => {
                    this.fullscreen = true
                })
            },
            beforeLeave()
            {
                this.fullscreen = false
            },
            leave(el, done)
            {
                setTimeout(done, 1e3)
            },
            clickOutside()
            {
                this.active = false
            },
            async loadSummary(country)
            {
                try {

                    let info, summaryData, summary

                    if ((info = this.cache.summary.find(d => d.country === country))) {
                        ({ summaryData } = info.data)

                    } else {
                        summaryData = await covidApi.getSummary()

                        this.cache.summary.push({
                            data: { summaryData },
                            country
                        })
                    }

                    summary = country !== 'Global'
                        ? summaryData.Countries.filter(e => e.Slug === country)[0]
                        : summaryData.Global

                    this.totalConfirmed = numberWithCommas(summary.TotalConfirmed)
                    this.totalRecovered = numberWithCommas(summary.TotalRecovered)
                    this.totalDeaths = numberWithCommas(summary.TotalDeaths)

                    this.setRecoveryRate(Math.floor(summary.TotalRecovered / summary.TotalConfirmed * 100))

                    if (!this.topAffected.length) {
                        this.setTopAffected(summaryData.Countries.sort((a, b) => {
                            return b.TotalConfirmed - a.TotalConfirmed
                        }))
                    }

                    return summaryData

                } catch (e) {
                }

                return {}
            },
            async loadAllTimeChart(country)
            {
                try {

                    let info, confirmData, recoveredData, deathsData, labels = []

                    if ((info = this.cache.allTimes.find(d => d.country === country))) {
                        ({ confirmData, recoveredData, deathsData, labels } = info.data)

                    } else if (country === 'Global') {
                        const worldData = await covidApi.getWorldAllTimeCases()

                        worldData.sort((a, b) => new Date(a.Date) - new Date(b.Date))

                        confirmData = extractWorldData(worldData, CASE_STATUS.confirmed)
                        recoveredData = extractWorldData(worldData, CASE_STATUS.recovered)
                        deathsData = extractWorldData(worldData, CASE_STATUS.deaths)

                        labels = this.buildLabels(worldData)

                    } else {
                        const confirmed = await covidApi.getCountryAllTimeCases(country, CASE_STATUS.confirmed),
                            recovered = await covidApi.getCountryAllTimeCases(country, CASE_STATUS.recovered),
                            deaths = await covidApi.getCountryAllTimeCases(country, CASE_STATUS.deaths)

                        confirmData = extractData(confirmed)
                        recoveredData = extractData(recovered)
                        deathsData = extractData(deaths)

                        labels = this.buildLabels(confirmed)
                    }
                    if (!info) {
                        this.cache.allTimes.push({
                            data: { confirmData, recoveredData, deathsData, labels },
                            country
                        })
                    }

                    this.allTimesSeries = [
                        { name: 'Confirmed', data: confirmData   },
                        { name: 'Recovered', data: recoveredData },
                        { name: 'Deaths',    data: deathsData    }
                    ]

                    this.allTimesOptions = {
                        ...this.allTimesOptions,

                        xaxis: {
                            categories: labels
                        }
                    }

                } catch (e) {
                }
            },
            async loadDaysChart(country)
            {
                try {

                    let info, confirmData, recoveredData, deathsData, labels = []

                    if ((info = this.cache.days.find(d => d.country === country))) {
                        ({ confirmData, recoveredData, deathsData, labels } = info.data)

                    } else if (country === 'Global') {
                        const worldData = await covidApi.getWorldDaysCases()

                        worldData.sort((a, b) => new Date(a.Date) - new Date(b.Date))

                        confirmData = extractWorldData(worldData, CASE_STATUS.confirmed)
                        recoveredData = extractWorldData(worldData, CASE_STATUS.recovered)
                        deathsData = extractWorldData(worldData, CASE_STATUS.deaths)

                        labels = this.buildLabels(worldData)

                    } else {
                        const confirmed = await covidApi.getCountryDaysCases(country, CASE_STATUS.confirmed),
                            recovered = await covidApi.getCountryDaysCases(country, CASE_STATUS.recovered),
                            deaths = await covidApi.getCountryDaysCases(country, CASE_STATUS.deaths)

                        confirmData = extractData(confirmed)
                        recoveredData = extractData(recovered)
                        deathsData = extractData(deaths)

                        labels = this.buildLabels(confirmed)
                    }
                    if (!info) {
                        this.cache.days.push({
                            data: { confirmData, recoveredData, deathsData, labels },
                            country
                        })
                    }

                    this.daysSeries = [
                        { name: 'Confirmed', data: confirmData   },
                        { name: 'Recovered', data: recoveredData },
                        { name: 'Deaths',    data: deathsData    }
                    ]

                    this.daysOptions = {
                        ...this.daysOptions,

                        xaxis: {
                            categories: labels
                        }
                    }

                } catch (e) {
                }
            },
            buildLabels(data)
            {
                return data.map(e => {
                    const d = new Date(e.Date)

                    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
                })
            },
            setTopAffected(list)
            {
                this.topAffected = list.slice(0, 10).map(c => ({
                    TotalConfirmed: numberWithCommas(c.TotalConfirmed),
                    TotalRecovered: numberWithCommas(c.TotalRecovered),
                    TotalDeaths: numberWithCommas(c.TotalDeaths),
                    Country: c.Country
                }))
            },
            setRecoveryRate(rate)
            {
                this.recoveryRateSeries = [rate]
            },
            selectCountry(e)
            {
                this.selectedCountry = e.Country
                this.active = false

                this.loadData(e.Slug)
            },
            setCountryList({ Countries })
            {
                if (typeof Countries === 'undefined') return

                Countries.unshift({ Country: 'Global', Slug: 'Global' })

                this.countriesList = Countries
                this.countries = Countries
            },
            search({ target })
            {
                this.countries = this.countriesList.filter(e => e.Country.toLowerCase().includes(target.value))
            },
            async loadData(country)
            {
                return await Promise.all([
                    this.loadSummary(country),
                    this.loadAllTimeChart(country),
                    this.loadDaysChart(country)
                ])
            },
            async init()
            {
                try {

                    if (!this.allTimesSeries.length) {
                        this.setCountryList((await this.loadData('Global')).filter(Boolean).shift())
                    }

                } catch (e) {
                }

                this.loading = false
            }
        },
        beforeMount()
        {
            import(/* webpackChunkName: "lite-yt" */ '~/assets/css/lite-yt-embed.css')
            import(/* webpackChunkName: "lite-yt" */ '~/utils/youtube/lite-yt-embed')
        }
    }
</script>

<style lang="scss">
    $bg-body: #fafbfd;
    $bg-content: #ffffff;
    $bg-hover: #f4f4f4;

    $color-txt: #172b4d;

    $nav-height: 70px;

    $shadow: 0 0 30px 0 rgb(82 63 105 / 5%);

    .covid__tracker--dialog .v-card {
        .v-toolbar .v-toolbar__items {
            align-items: center;

            .v-btn {
                border-radius: 50%;
                height: 48px !important;
                width: 48px;
            }
        }
        .v-card__text {
            position: relative;
            padding: unset;

            [v-cloak] {
                display: none
            }

            .box {
                width: 100%;
                height: 100%;
                border-radius: 7px;
                padding: 15px;
            }

            .box-hover {
                transition: transform .2s ease-in-out;

                &:hover {
                    transform: scale(1.05) translateY(-10px);
                    box-shadow:
                        0 4px 5px -2px rgba(0,0,0,.2),
                        0 7px 10px 1px rgba(0,0,0,.14),
                        0 2px 16px 1px rgba(0,0,0,.12);
                }
            }

            .box-header {
                position: relative;
                padding: 10px 0 30px;
                font-size: 1.25rem;
                font-weight: 700;
                color: $color-txt;
                text-transform: uppercase;
            }

            .country-select {
                position: relative;
                height: 100%;
            }

            .country-select-toggle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 1.25rem;
                padding: 0 15px;
                cursor: pointer;
                font-weight: 700;
                position: relative;
                height: 100%;
            }

            .country-select-list {
                position: absolute;
                top: calc(100% + 50px);
                left: 0;
                width: 100%;
                max-height: 600px;
                overflow-y: scroll;
                padding: 15px;
                background-color: $bg-content;
                z-index: 98;
                box-shadow: $shadow;
                border-radius: 10px;
                visibility: hidden;
                opacity: 0;
                transition: all .3s ease-in-out;

                input {
                    padding: 10px;
                    width: 100%;
                    background-color: #e2e8f0;
                    border: none;
                    outline: none;
                    border-radius: 5px;
                }

                &.active {
                    top: calc(100% + 20px);
                    visibility: visible;
                    opacity: 1;
                }
            }

            .country-item {
                padding: 5px 15px;
                cursor: pointer;

                &:hover {
                    background-color: $bg-hover;
                }
            }

            .count {
                padding: 5px;
                display: flex;
                align-items: center;
                justify-content: flex-start;
            }

            .count-icon {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                display: grid;
                place-items: center;
                font-size: 2.5rem;
                margin-right: 15px;
            }

            .count-info h5 {
                font-size: 2vmax;
                margin-bottom: 5px;
            }
            .count-info span {
                text-transform: uppercase;
                font-weight: 700;
            }

            .count-confirmed .count-icon {
                background-color: #ffa0a0;
                color: red;
            }
            .count-confirmed .count-info h5 {
                color: red;
            }

            .count-recovered .count-icon {
                background-color: #bffabf;
                color: green;
            }
            .count-recovered .count-info h5 {
                color: green;
            }

            .count-death .count-icon {
                background-color: #e2e8f0;
                color: #373c43;
            }
            .count-death .count-info h5 {
                color: #373c43;
            }

            .table-countries {
                width: 100%;
                border-spacing: 0;

                thead tr th,
                tbody tr td {
                    border-bottom: 1px solid $bg-body;
                }
                th {
                    padding: .5rem;
                }
                td {
                    font-weight: 600;
                    padding: .5rem;
                    width: 25%;
                    text-align: center;
                }

                tbody tr:hover {
                    background-color: $bg-hover;
                }
            }

            .loader {
                position: absolute;
                z-index: 99;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                display: grid;
                place-items: center;
                background-color: $bg-body;
                font-size: 10rem;

                svg {
                    animation: loader 1s infinite;
                }
            }

            .footer {
                font-size: 1.25rem;
                text-align: center;
                padding: 2rem;

                a,
                a:visited {
                    color: #82b1ff;
                }
            }
        }
    }

    .slideY-enter-active {
        animation: slideYIn 1s ease;
    }
    .slideY-leave-active {
        animation: slideYOut 1s ease;
    }
    @keyframes slideYIn {
        from {
            opacity: 0;
            transform: translateY(-50vh);
        }
        70% {
            opacity: 1;
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideYOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        90% {
            opacity: 0;
        }
        to {
            opacity: 0;
            transform: translateY(-50vh);
        }
    }
</style>
