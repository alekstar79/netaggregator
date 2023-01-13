<template>
    <v-card :class="{ fullscreen: mobile }"
        :color="showMonthList ? 'rgba(0,0,0,0)' : backgroundColor"
        class="calendar"
        rounded="md"
        flat
    >
        <v-system-bar v-if="mobile && $store.state.app.vkapp" :color="backgroundColor" height="70px" />

        <div class="calendar-header" :style="{ visibility: showMonthList ? 'hidden' : 'visible' }">
            <span @click="showMonthList = true" class="month-picker">
                {{ monthNames[currMonth] }}
            </span>

            <div class="year-picker">
                <span class="year-change" @click="currYear--">
                    <pre>&#60;</pre>
                </span>

                <span>{{ currYear }}</span>

                <span class="year-change" @click="currYear++">
                    <pre>&#62;</pre>
                </span>
            </div>
        </div>

        <div class="calendar-body" :style="{ visibility: showMonthList ? 'hidden' : 'visible' }">
            <div class="calendar-week-day">
                <div v-for="wd in weekDays" :key="wd" :style="{ color: '#f8fbff' }">
                    {{ wd }}
                </div>
            </div>

            <div class="calendar-days" :key="force">
                <div v-for="({ day, curr }) in monthDays"
                    :class="{ 'calendar-day-hover': typeof day !== 'undefined', 'curr-date': curr }"
                    :style="{ color: '#f8fbff' }"
                    :key="day"
                >
                    {{ day }}
                    <template v-if="typeof day !== 'undefined'">
                        <span /><span /><span /><span />
                    </template>
                </div>
            </div>
        </div>

        <div class="calendar-footer" :style="{ visibility: showMonthList ? 'hidden' : 'visible' }">
            <v-btn @click.stop="$emit('off')" color="#fff" icon>
                <span class="mdi mdi-power" />
            </v-btn>
            <v-btn @click.stop="$emit('flip')" color="#fff" icon>
                <span class="mdi mdi-desaturate" />
            </v-btn>
        </div>

        <div class="month-list" :class="{ show: showMonthList }" :style="{ backgroundColor }">
            <div v-for="(m, i) in monthNames" :key="m">
                <div @click="setCurrentMonth(i)" :style="{ color: '#f8fbff' }">
                    {{ m }}
                </div>
            </div>
        </div>
    </v-card>
</template>

<script>
    const data = {
        en_months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        ru_months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        en_days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ru_days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    }

    const isLeapYear = year =>  (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)
    const getFebDays = year => isLeapYear(year) ? 29 : 28

    export default {
        props: {
            backgroundColor: {
                default: 'transparent',
                type: String
            }
        },
        data() {
            const date = new Date()

            return {
                currYear: date.getFullYear(),
                currMonth: date.getMonth(),
                showMonthList: false,
                force: false
            }
        },
        watch: {
            monthDays: {
                deep: true,
                handler() {
                    this.force = !this.force
                }
            }
        },
        computed: {
            monthDays() {
                let daysOfMonth = [31, getFebDays(this.currYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    firstDay = (new Date(this.currYear, this.currMonth)).getDay(),
                    countMonthDays = daysOfMonth[this.currMonth] + firstDay - 1,
                    currDate = new Date(),

                    cY = currDate.getFullYear(),
                    cM = currDate.getMonth(),
                    cD = currDate.getDate(),

                    days = []

                for (let day, i = (this.lang === 'en' ? 0 : 1); i <= countMonthDays; i++) {
                    days.push(i >= firstDay ? { day: (day = i - firstDay + 1), curr: day === cD && this.currMonth === cM && this.currYear === cY } : {})
                }

                return days
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            lang() {
                return this.$store.state.app.locale || 'ru'
            },
            monthNames() {
                return data[`${this.lang}_months`]
            },
            weekDays() {
                return data[`${this.lang}_days`]
            }
        },
        methods: {
            setCurrentMonth(idx)
            {
                this.showMonthList = false
                this.currMonth = idx
            }
        }
    }
</script>

<style lang="scss" scoped>
    $calc-dark-main: #1f1f1f;
    $calc-dark-second: #79788c;
    $calc-dark-hover: #2c2c2c;
    $calc-dark-text: #f8fbff;

    $calc-light-main: #fdfdfd;
    $calc-light-second: hsla(0,0%,100%,.25);
    $calc-light-hover: #edf0f5;
    $calc-light-text: #f8fbff;

    $calc-white: #fff;

    .calendar {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 10px;
        height: 100%;
        width: 100%;

        border-radius: 5px;
        user-select: none;
        overflow: hidden;
        cursor: grabbing;
        z-index: 7;

        &.fullscreen {
            border-radius: 0;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0;

            font-weight: 600;
            color: $calc-light-text;

            .month-picker {
                position: relative;
                padding: 10px;

                cursor: pointer;

                &::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;

                    height: 100%;
                    width: 100%;

                    will-change: opacity;
                    transition: opacity .2s linear;
                    background-color: $calc-light-hover;
                    opacity: 0;
                }
                &:hover::after {
                    opacity: .4;
                }
            }
            .year-picker {
                display: flex;
                align-items: center;
            }
            .year-change {
                display: grid;
                place-items: center;
                position: relative;

                margin: 0 7px;
                height: 35px;
                width: 35px;

                border-radius: 50%;
                cursor: pointer;

                &::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;

                    height: 100%;
                    width: 100%;

                    border-radius: 50%;
                    will-change: opacity;
                    transition: opacity .2s linear;
                    background-color: $calc-light-hover;
                    opacity: 0;
                }
                &:hover::after {
                    opacity: .4;
                }
            }
        }
        .calendar-body {
            padding: 0;

            .calendar-week-day {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                margin-bottom: 5px;
                height: 40px;

                font-weight: 400;
                border-bottom: 1px solid hsla(0,0%,100%,.2);

                div {
                    display: grid;
                    place-items: center;
                    color: $calc-light-text;
                }
            }
            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                color: $calc-light-text;

                div {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    height: 33px;
                    width: 33px;
                    padding: 0;

                    font-weight: 500;
                    cursor: pointer;
                    animation: to-top 1s forwards;

                    span {
                        transition: width .2s ease-in-out, height .2s ease-in-out;
                        position: absolute;

                        &:nth-child(1),
                        &:nth-child(3) {
                            width: 2px;
                            height: 0;
                            background-color: $calc-light-text;
                        }
                        &:nth-child(1) {
                            bottom: 0;
                            left: 0;
                        }
                        &:nth-child(3) {
                            top: 0;
                            right: 0;
                        }
                        &:nth-child(2),
                        &:nth-child(4) {
                            width: 0;
                            height: 2px;
                            background-color: $calc-light-text;
                        }
                        &:nth-child(2) {
                            top: 0;
                            left: 0;
                        }
                        &:nth-child(4) {
                            bottom: 0;
                            right: 0;
                        }
                    }
                    &:hover span {
                        &:nth-child(1),
                        &:nth-child(3) {
                            height: 100%;
                        }
                        &:nth-child(2),
                        &:nth-child(4) {
                            width: 100%;
                        }
                        &:nth-child(2) {
                            transition-delay: .2s;
                        }
                        &:nth-child(3) {
                            transition-delay: .4s;
                        }
                        &:nth-child(4) {
                            transition-delay: .6s;
                        }
                    }
                    &.curr-date {
                        background-color: $calc-light-second;
                        border-radius: 50%;
                    }
                    &.curr-date span {
                        display: none;
                    }
                }
            }
        }
        .calendar-footer button {
            font-size: 22px;
            margin: 0 5px;

            .v-btn__content {
                line-height: unset;
            }
        }
        .month-list {
            display: grid;
            grid-template-columns: repeat(3, auto);
            position: absolute;
            left: 0;
            top: 0;

            padding: 10px;
            height: 100%;
            width: 100%;

            font-size: 14px;
            font-weight: 400;

            transform: scale(1.2);
            background-color: $calc-light-main;
            pointer-events: none;
            visibility: hidden;

            &.show {
                transform: scale(1);
                visibility: visible;
                pointer-events: visible;
                transition: all .2s ease-in-out;
            }
            & > div {
                display: grid;
                place-items: center;

                & > div {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    height: 100%;
                    width: 100%;

                    border-radius: 5px;
                    cursor: pointer;
                    color: $calc-light-text;

                    &::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;

                        height: 100%;
                        width: 100%;

                        transition: opacity .2s linear;
                        background-color: $calc-light-hover;
                        opacity: 0;
                    }
                    &:hover::after {
                        opacity: .4;
                    }
                }
            }
        }
        &.theme--dark {
            background-color: $calc-dark-main;

            .calendar-header {
                color: $calc-dark-text;

                .month-picker:hover,
                .year-change:hover {
                    background-color: $calc-dark-hover;
                }
            }
            .calendar-body {
                .calendar-week-day div {
                    color: $calc-dark-text;
                }
                .calendar-days {
                    color: $calc-dark-text;

                    div span {
                        &:nth-child(1),
                        &:nth-child(2),
                        &:nth-child(3),
                        &:nth-child(4) {
                            background-color: $calc-dark-text;
                        }
                    }
                }
            }
            .month-list {
                background-color: $calc-dark-main;

                & > div > div {
                    color: $calc-dark-text;

                    &:after {
                        background-color: $calc-dark-hover;
                    }
                }
            }
        }
    }
    @keyframes to-top {
        0% {
            transform: translateY(100%);
            opacity: 0;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
