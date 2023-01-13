<template>
    <v-card :class="{ fullscreen: mobile }" :color="backgroundColor" class="calculator" rounded="md" dark flat>
        <v-system-bar v-if="mobile && $store.state.app.vkapp" :color="backgroundColor" height="70px" />

        <div class="calc-display">
            <div class="history" ref="history">
                {{ history | stringify | fix('history', _self) | huge | gap }}
            </div>
            <div class="output" ref="output">
                {{ calculation | stringify | fix('current', _self) | huge | gap }}
            </div>
        </div>

        <div class="calc-keyboard">
            <v-btn @click.stop="$emit('off')" text>
                <span class="mdi mdi-power" />
            </v-btn>
            <v-btn @click.stop="$emit('flip')" text>
                <span class="mdi mdi-desaturate" />
            </v-btn>
            <v-btn @click.stop="clear" text>
                <span>ac</span>
            </v-btn>
            <v-btn class="vb" @click="input('/')" text>
                /
            </v-btn>

            <v-btn @click="input('7')" text>7</v-btn>
            <v-btn @click="input('8')" text>8</v-btn>
            <v-btn @click="input('9')" text>9</v-btn>
            <v-btn class="vb" @click="input('*')" text>
                *
            </v-btn>

            <v-btn @click="input('4')" text>4</v-btn>
            <v-btn @click="input('5')" text>5</v-btn>
            <v-btn @click="input('6')" text>6</v-btn>
            <v-btn class="vb" @click="input('-')" text>
                -
            </v-btn>

            <v-btn @click="input('1')" text>1</v-btn>
            <v-btn @click="input('2')" text>2</v-btn>
            <v-btn @click="input('3')" text>3</v-btn>
            <v-btn class="vb" @click="input('+')" text>
                +
            </v-btn>

            <v-btn class="hb" @click.stop="copy" text>
                <span class="mdi mdi-content-copy" />
            </v-btn>

            <v-btn class="hb" @click="input('0')" text>0</v-btn>
            <v-btn class="hb" @click="input('.')" text>.</v-btn>
            <v-btn class="hb vb" @click="input('=')" text>
                =
            </v-btn>
        </div>
    </v-card>
</template>

<script>
    import { noExponents } from '~/utils/common/exponents.mjs'

    const fixLastDot = s => s[s.length - 1] === '.' ? s.slice(0, -1) : s,

        toExponents = (value, fraction = 5) => {
            let exp

            try {

                exp = (Number(value.trim())).toExponential(fraction)

                if (!isNaN(exp) && exp.length < value.length) {
                    value = exp
                }

            } catch (e) {
            }

            return value
        },

        fixExponents = v => {
            let exp

            if ((exp = v.match(/\d(\.\d+)?[eE][-+]\d+/))) {
                v = v.replace(exp[0], noExponents(exp[0]))
            }

            return v
        }

    export default {
        props: {
            backgroundColor: {
                default: 'transparent',
                type: String
            }
        },
        filters: {
            stringify: value => value.toString(),

            fix: (value, entity, self) => {
                value = value.replaceAll(' ', '')
                value = fixExponents(value)

                let sign = (value.match(/^(-)\s*[.\d]+/) || [])[1],
                    history = entity === 'history',

                    data = {
                        value: value.slice(sign ? 1 : 0, history ? -1 : value.length),
                        operator: history ? value.slice(-1) : '',
                        sign: sign || ''
                    },

                    n = Number(data.value),
                    exp,
                    i

                if (/[1-9]/.test(data.value) && Math.abs(n) < 1e-11) {
                    self[entity] = data.value = '0'
                    data.operator = ''
                }
                if (data.value.length > 9 && !/[eE]/.test(data.value)) {
                    data.value = toExponents(data.value)
                }
                if ((exp = data.value.match(/(\d)\.(\d+)([eE][-+]\d+)/))) {
                    data.value = data.value.replace(exp[0], exp[1] + '.' + exp[2].substr(0, 5) + exp[3])
                }

                value = data.value
                    .replace(/(0+)(?=[eE])/, '')
                    .replace(/\.(?=[eE])/, '')
                    .replace(/[eE]\+0/, '')

                if ((exp = value.match(/(\d)\.(\d{1,5})[eE]\+([1234])$/))) {
                    if ((i = Number(exp[3])) > exp[2].length) {
                        exp[2] = exp[2].padEnd(i, '0')
                    }

                    value = fixLastDot(exp[1] + exp[2].splice(i, 0, '.'))
                }
                if ((exp = value.match(/(\d)\.(\d{1,5})[eE]-([1234])$/))) {
                    exp[1] = exp[1].padStart(Number(exp[3]) + 1, '0')

                    value = exp[1].splice(1, 0, '.') + exp[2]
                }

                return data.sign + value + data.operator
            },
            huge: value => {
                if (/[eE]/.test(value)) return value

                const parts = value.split('.')

                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

                return parts.join('.')
            },
            gap: value => {
                let exp

                if ((exp = value.match(/\d(\.\d+)?[eE][-+]\d+/))) {
                    value = value.replace(exp[0], '_QQQ_')
                }

                value = value
                    .replaceAll('*', ' * ')
                    .replaceAll('/', ' / ')
                    .replaceAll('+', ' + ')
                    .replaceAll('-', ' - ')

                if (/_QQQ_/.test(value)) {
                    value = value.replace('_QQQ_', exp[0])
                }

                return value
            }
        },
        data: () => ({
            current: '',
            history: ''
        }),
        computed: {
            calculation() {
                return  this.current.length > 0 ? this.current : 0
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        methods: {
            copy()
            {
                import(/* webpackChunkName: "clipboard" */ 'clipboard-polyfill/text')
                    .then(({ writeText }) => writeText(this.$refs.output.textContent.trim().replaceAll(' ', '')))
                    .then(() => this.$bus.$emit('snack', { content: 'graph.copied', color: 'success' }))
                    .catch(() => this.$bus.$emit('snack', { content: 'common.error', color: 'error' }))
            },
            backspace()
            {
                let current = this.current.slice()

                if (/[eE]/.test(current)) {
                    current = noExponents(current)
                }
                if (current.length > 11 && /\./.test(current)) {
                    current = current.replace(/\d(?=\.)/, '')
                } else {
                    current = current.slice(0, -1)
                }

                this.current = current
            },
            clear()
            {
                this.current = ''
                this.history = ''
            },
            calculate(n1, n2, operation)
            {
                n1 = parseFloat(n1)
                n2 = parseFloat(n2)

                let fix = r => `${Number(r)}`.replace(/\.0*$/g, ''),
                    result = 0

                switch (operation) {
                    case '+': result = n1 + n2; break
                    case '-': result = n1 - n2; break
                    case '*': result = n1 * n2; break
                    case '/': result = n2 !== 0
                        ? n1 / n2
                        : 0
                }

                return fix(result)
            },
            process()
            {
                let line = this.history + this.calculation,
                    first, operation, numbers

                line = line.replaceAll(' ', '')

                try {

                    // eslint-disable-next-line no-eval
                    this.current = eval(line).toString()
                    this.history = ''
                    return

                } catch (e) {
                }

                line = fixExponents(line)
                first = line.split('')[0]
                operation = line.match(/[+\-*/]/g)
                numbers = line.match(/\d+\.?\d*/g)

                if (!operation) return

                if (first >= 0) {
                    operation = [''].concat(operation)
                } else if (first === '-') {
                    numbers[0] = `-${numbers[0]}`
                }

                this.current = numbers.reduce((prev, curr, i) => {
                    return this.calculate(prev, curr, operation[i])
                })

                this.history = ''
            },
            input(value)
            {
                if (typeof this.current !== 'string') {
                    this.current = this.current.toString()
                }
                if (!isNaN(Number(value))) {
                    if (this.current.length < 10) {
                        this.current += value
                    }

                } else if (value === '1/x') {
                    this.current = noExponents(1 / Number(this.calculation))

                } else if (value === '√') {
                    const number = Number(this.calculation),
                        imaginary = number < 0 ? 'i' : '',
                        n = Math.sqrt(Math.abs(number))

                    this.current = noExponents(n) + imaginary

                } else if (value === '.') {
                    let skip = false

                    if (this.current.split('').reverse().some(v => {
                        if (skip || !isNaN(Number(v))) return false

                        if (['+','-','*','/'].includes(v)) {
                            skip = true
                            return false
                        }

                        return v === '.'

                    })) {
                        value = ''
                    }

                    this.current = `${Number(this.current)}` + value

                } else if (value === '=') {
                    if (!this.history) return

                    this.current = fixLastDot(this.current)
                    this.process()

                } else if (/[+\-*/]/.test(value)) {
                    this.current = fixLastDot(this.current)

                    if (this.history) {
                        this.process()
                    }
                    if (this.current) {
                        this.history = this.current + value
                        this.current = ''
                    }
                }
            }
        },
        mounted()
        {
            this.clear()
        }
    }
</script>

<style lang="scss" scoped>
    .calculator {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 100%;
        width: 100%;

        border-radius: 5px;
        user-select: none;
        overflow: hidden;
        cursor: grabbing;
        z-index: 7;

        .calc-display {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .history,
            .output {
                padding-right: 10px;
                min-height: 40px;
                width: 100%;

                line-height: 36px;
                text-align: right;

                user-select: none;
                overflow: hidden;
                cursor: grabbing;
                color: white;
            }
            .output {
                font-size: 34px;
                border-bottom: 1px solid hsla(0,0%,100%,.1);
                border-top: none;
            }
            .history {
                font-size: 24px;
            }
        }
        .calc-keyboard {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            padding: 7px;
            width: 100%;

            button {
                height: 50px;
                min-width: 60px;
                padding: 0;

                transition: 250ms all ease;
                transform: scale(1);
                font-weight: 600;
                font-size: 20px;
                color: #fff;

                border-radius: 0;
                user-select: none;

                &:not(.hb) {
                    border-bottom: 1px solid rgba(255,255,255,.1);
                }
                &:not(.vb) {
                    border-right: 1px solid rgba(255,255,255,.1);
                }
                &:hover::before {
                    background-color: currentColor;
                    opacity: .3;
                }
                &:active {
                    transform: scale(.9);
                }
                .mdi::before {
                    font-weight: 600;
                    font-size: 20px;
                }
            }
        }
        &.fullscreen {
            border-radius: 0;
            padding: 10px 0;

            .history, .output {
                min-height: 50px;
            }
            .calc-keyboard {
                padding: 0;

                button {
                    height: 60px;
                }
            }
        }
    }
</style>
