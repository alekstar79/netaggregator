import { debounce } from '~/utils/common/debounce.mjs'
import { delay } from '~/utils/common/delay.mjs'
import { running } from '~/utils/callbacks.mjs'

import { Cancelable } from '~/utils/cancelable.mjs'
import { Bindings } from '~/utils/keybind.mjs'

export const utils = { debounce, delay }
export { running, running as run }

export function extract(steps)
{
    const transform = s => ([s.step, s.correction]),
        filter = s => 'correction' in s

    return {
        steps,
        corrections: Object.fromEntries(
            steps.filter(filter).map(transform)
        )
    }
}

export function wrap(main, additional)
{
    return function(element) {
        if (!main(element)) {
            additional(element)
        }
    }
}

export function extendClean(item)
{
    item.cleanup = 'cleanup' in item ? wrap(item.cleanup, this.cleanup) : this.cleanup

    return item
}

export function format(str, ...args)
{
    return str.replace(/{(\d+)}/g, (m, n) => typeof args[n] !== 'undefined' ? args[n] : m)
}

export function perform({ callbacks, args = [] }, wait = 100)
{
    return new Cancelable(async (resolve, reject) => {
        for (const cb of callbacks) { try {
            if (typeof cb === 'function') {
                await cb(...args)
            }
        } catch (e) {
            reject(e)
        } }

        setTimeout(resolve, wait)
    })
}

export function call(cb, args, ms = 0)
{
    return () => perform({ callbacks: [cb, () => delay(ms)], args })
}

export function dom(selector, element = document.body)
{
    return element.querySelector(selector)
}

export function safe(callback)
{
    try {

        callback()

    } catch (e) {
    }
}

export function Stage(options)
{
    Object.keys(options).forEach(p => {
        this[p] = typeof options[p] === 'function'
            ? options[p].bind(this)
            : options[p]
    })
}

export function noop() {}

/**
* @see https://introjs.com/docs
* @see https://github.com/usablica/intro.js
*/
export default function(source, methods = {}, data = {})
{
    return {
        data: () => ({
            presentation: false,

            intro: {
                bindings: Bindings.instance,
                instance: null,

                step: new Cancelable(),
                allowChangeRoute: false,
                autoRefresh: true,
                autoPlay: false,

                options: {
                    keyboardNavigation: false,
                    disableInteraction: true,
                    showStepNumbers: true
                },

                corrections: [],
                unbind: [],
                steps: [],

                target: null,
                hold: null,
                tip:  null,
                tid:  null,

                ...data
            }
        }),
        watch: {
            $route() {
                if (!this.intro.allowChangeRoute) {
                    this.presentation && this.intro.instance.exit(null, true)
                }

                this.intro.allowChangeRoute = false
            }
        },
        computed: {
            route: {
                set(path) {
                    this.intro.allowChangeRoute = true
                    this.$router.replace({ path }).catch(noop)
                },
                get() {
                    return this.$route.path
                }
            }
        },
        methods: {
            cleanup: noop,

            initIntro()
            {
                return Promise.resolve()
                    .then(() => import(/* webpackChunkName: "intro-css" */ '~/assets/css/intro.css'))
                    .then(() => import(/* webpackChunkName: "intro-js"  */ 'intro.js'))
                    .then(m => m.default || m)
                    .then(this.setIntro)
            },
            setIntro(intro)
            {
                const { corrections, steps } = extract(source(this))

                this.setHooks(intro)
                this.$set(this.intro, 'instance', intro())

                this.intro.corrections = corrections
                this.intro.steps = steps

                this.intro.instance.onafterchange(this.afterChangeHandler)
                this.intro.instance.onbeforeexit(this.exitHandler)
                this.intro.instance.setOptions(
                    Object.assign(this.intro.options, {
                        steps: steps.map(extendClean.bind(this))
                    })
                )
            },
            setHooks(intro)
            {
                const _self = this

                intro.fn.original || (intro.fn.original = {})

                intro.fn.translate = _self.translate.bind(_self)

                intro.fn.previousStep = (function(prev) {
                    intro.fn.original.previousStep = prev

                    return function({ cleanup, action, onchange, element } = {}) {
                        const args = [element, _self.intro.tip],
                            callbacks = [cleanup, action]

                        _self.intro.step.cancel()
                        _self.intro.step = perform({ callbacks, args })
                        _self.intro.step.then(call(prev.bind(this)))
                            .then(call(onchange, args))
                            .then(_self.afterStep)
                            .catch(noop)
                    }
                })(intro.fn.original.previousStep || intro.fn.previousStep)

                intro.fn.nextStep = (function(next) {
                    intro.fn.original.nextStep = next

                    return function({ cleanup, action, onchange, element } = {}) {
                        const args = [element, _self.intro.tip],
                            callbacks = [cleanup, action]

                        _self.intro.step.cancel()
                        _self.intro.step = perform({ callbacks, args })
                        _self.intro.step.then(call(next.bind(this)))
                            .then(call(onchange, args))
                            .then(_self.afterStep)
                            .catch(noop)
                    }
                })(intro.fn.original.nextStep || intro.fn.nextStep)

                intro.fn.goToStep = (function(goto) {
                    intro.fn.original.goToStep = goto

                    return function(step) {
                        const { cleanup, action, onchange, element } = this._introItems[step - 1],
                            args = [element, _self.intro.tip],
                            callbacks = [cleanup, action]

                        _self.intro.step.cancel()
                        _self.intro.step = perform({ callbacks, args })
                        _self.intro.step.then(call(goto.bind(this, step)))
                            .then(call(onchange, args))
                            .then(_self.afterStep)
                            .catch(noop)
                    }
                })(intro.fn.original.goToStep || intro.fn.goToStep)

                intro.fn.refresh = (function(refresh) {
                    intro.fn.original.refresh = refresh

                    return function(force = false) {
                        refresh.call(this, force)
                    }
                })(intro.fn.original.refresh || intro.fn.refresh)

                intro.fn.exit = (function(exit) {
                    intro.fn.original.exit = exit

                    return function(main, force = false) {
                        main && main.classList.remove('fixed-presentation')

                        _self.cleanup()

                        exit.call(this, force)
                    }
                })(intro.fn.original.exit || intro.fn.exit)

                intro.fn.start = (function(start) {
                    intro.fn.original.start = start

                    return async function({ fixed = false } = {}) {
                        this._options.steps = [].map.call(_self.intro.steps, this.translate, this)

                        let self = start.call(this),
                            bullets,
                            skip,
                            prev,
                            next,
                            main

                        if (typeof self._introBeforeExitCallback !== 'function') {
                            self._introBeforeExitCallback = noop
                        }
                        if (typeof self._introCompleteCallback !== 'function') {
                            self._introCompleteCallback = noop
                        }
                        if (typeof self._introSkipCallback !== 'function') {
                            self._introSkipCallback = noop
                        }

                        try {

                            await running((_, i) => {
                                bullets = dom('.introjs-bullets')
                                skip = dom('.introjs-skipbutton')
                                prev = dom('.introjs-prevbutton')
                                next = dom('.introjs-nextbutton')
                                main = dom('.v-main')

                                _self.intro.tip = dom('.introjs-helperLayer')

                                if ((bullets && skip && prev && next) || i > 10) {
                                    return true
                                }
                            })

                            next.onclick = () => {
                                const items = typeof self._introItems !== 'undefined'

                                if (items && self._introItems.length - 1 !== self._currentStep) {
                                    self.nextStep(self._introItems[self._currentStep + 1])

                                } else {
                                    self._introCompleteCallback()
                                    self._introBeforeExitCallback()
                                    self.exit(main)
                                }
                            }

                            prev.onclick = () => {
                                if (typeof self._introItems === 'undefined') return

                                if (self._currentStep !== 0) {
                                    self.previousStep(self._introItems[self._currentStep - 1])
                                }
                            }

                            skip.onclick = () => {
                                const items = typeof self._introItems !== 'undefined'

                                if (items && self._introItems.length - 1 === self._currentStep) {
                                    self._introCompleteCallback()
                                }

                                self._introSkipCallback()
                                self._introBeforeExitCallback()
                                self.exit(main)
                            }

                            bullets.querySelectorAll('ul > li > a').forEach(b => {
                                b.onclick = () => self.goToStep(b.getAttribute('data-stepnumber'))
                            })

                            _self.intro.unbind = _self.intro.bindings.bind([
                                { keys: 'ArrowRight', handler: next.onclick.bind(next) },
                                { keys: 'ArrowLeft',  handler: prev.onclick.bind(prev) },
                                { keys: 'Escape',     handler: skip.onclick.bind(skip) }
                            ])

                            _self.intro.bindings.track()

                            _self.intro.next = next
                            _self.intro.prev = prev
                            _self.intro.skip = skip

                            fixed && main.classList.add('fixed-presentation')

                            if (typeof self._introItems !== 'undefined') {
                                const options = self._introItems[self._currentStep]

                                await perform({
                                    callbacks: [options.cleanup, options.action],
                                    args: [options.element, _self.intro.tip]
                                })

                                 self.refresh(true)
                                _self.afterStep()
                            }

                        } catch (e) {
                        }
                    }
                })(intro.fn.original.start || intro.fn.start)
            },
            translate(options)
            {
                return {
                    ...options,

                    intro: /^intro\.\w+$/.test(options.intro)
                        ? this.$t(options.intro)
                        : options.intro
                }
            },
            afterChangeHandler(/* target */)
            {
                const { tip, corrections, instance: { _currentStep: step } } = this.intro,
                    correction = corrections[step + 1]

                this.intro.autoRefresh && this.intro.instance.refresh(true)

                if (!tip) return

                this.applyTheme()

                correction && Object.keys(correction).forEach(k => {
                    tip.style[k] = format(correction[k], tip.style[k])
                })
            },
            exitHandler()
            {
                this.intro.bindings.unbind(this.intro.unbind)

                this.tid && clearTimeout(this.tid)
                this.presentation = false

                this.cleanup(null, null, true)
            },
            afterStep()
            {
                const { _direction, _introItems, _currentStep } = this.intro.instance

                if (this.intro.autoPlay && _direction !== 'backward' && _introItems.length - 1 > _currentStep) {
                    this.tid && clearTimeout(this.tid) // scheduling the next stage of the intro tour
                    this.tid = setTimeout(this.intro.next.onclick, 1500)
                }
            },
            goToStep(step)
            {
                this.intro.instance && this.intro.instance.goToStep(step)
            },
            applyTheme()
            {
                this.intro.tip.classList[this.$vuetify.theme.dark ? 'add' : 'remove']('theme--dark')
            },
            async startIntro(options = {})
            {
                try {

                    this.presentation = options.presentation || true
                    await this.intro.instance.start()
                    this.applyTheme()

                } catch (e) {
                }
            },

            ...methods
        },
        mounted()
        {
            this.initIntro().catch(e => this.$bus.$emit('snack', { content: e.message, color: 'warning', raw: true }))
        },
        beforeRouteLeave(to, from, next)
        {
            if (!this.intro.allowChangeRoute) {
                this.presentation && this.intro.instance.exit(null, true)
            }

            next()
        }
    }
}
