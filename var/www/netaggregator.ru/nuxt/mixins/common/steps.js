import introWrapper, { Stage, dom, safe, run, utils } from './intro.js'

export default introWrapper(function(self)
{
    self.intro.options.showBullets = false

    let npad = v => v.toString().padStart(2, '0'),
        side = dom('.side-nav'),
        step = 0

    return [new Stage({
        step: ++step, // 1
        element: '#app',
        intro: 'intro.app_01',
        action(/* target, tip */) {
            return new Promise(resolve => {
                self.$bus.$emit('sidebar:restore')

                if (self.route !== '/chatbot') {
                    self.route = '/chatbot'
                }

                setTimeout(resolve, 250)
            })
        }
    }),new Stage({
        step: ++step, // 2
        element: '.app-toolbar',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_02'
    }),new Stage({
        step: ++step, // 3
        element: '.sidebar-toggler',
        intro: 'intro.app_03'
    }),new Stage({
        step: ++step, // 4
        element: '.dots-nav',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_04'
    }),new Stage({
        step: ++step, // 5
        element: '.tools',
        position: 'bottom-right-aligned',
        intro: 'intro.app_05'
    }),new Stage({
        step: ++step, // 6
        element: '.calculator',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_06',
        cleanup() {
            safe(() => self.intro.target.classList.remove(self.intro.target.getAttribute('data-rem')))
            self.combo = 'calculator'
            self.calculator = true
            return true
        },
        onchange: utils.debounce(function() {
            const t = dom('.v-application--wrap .wrapper .calculator'),
                layer = dom('.introjs-tooltipReferenceLayer')

            if (layer && t) {
                Object.assign(layer.style, {
                    left: `${t.clientX - 5}px`,
                    top: `${t.clientY - 5}px`,
                    height: '355px',
                    width: '265px'
                })
            }

        }, 500),
        action() {
            return new Promise(resolve => {
                let t, idx = this.step - 1

                self.combo = 'calculator'
                self.calculator = true

                run((_, i) => {
                    if ((t = dom('.v-application--wrap .wrapper .calculator')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 500)
                })
            })
        }
    }),new Stage({
        step: ++step, // 7
        element: '.calendar',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_07',
        cleanup() {
            safe(() => self.intro.target.classList.remove(self.intro.target.getAttribute('data-rem')))
            self.combo = 'calendar'
            self.calculator = true
            return true
        },
        onchange: utils.debounce(function() {
            const t = dom('.v-application--wrap .wrapper .calendar'),
                layer = dom('.introjs-tooltipReferenceLayer')

            if (layer && t) {
                Object.assign(layer.style, {
                    left: `${t.clientX - 5}px`,
                    top: `${t.clientY - 5}px`,
                    height: '355px',
                    width: '265px'
                })
            }

        }, 500),
        action() {
            return new Promise(resolve => {
                let t, idx = this.step - 1

                self.$bus.$emit('sidebar:restore')
                self.combo = 'calendar'
                self.calculator = true

                run((_, i) => {
                    if ((t = dom('.v-application--wrap .wrapper .calendar')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 500)
                })
            })
        }
    }),new Stage({
        step: ++step, // 8
        element: side,
        intro: 'intro.app_08',
        onchange: utils.debounce(function(target) {
            self.activateItem(target, 'v-navigation-drawer--open')
            dom('.introjs-tooltipReferenceLayer .introjs-tooltip').style.top = '10%'

        }, 250),
        action() {
            return new Promise(resolve => {
                self.$bus.$emit('sidebar:pullout')
                setTimeout(resolve, 250)
            })
        }
    }),...([].slice.call(side.querySelectorAll('.v-list > a.v-list-item'))
        .filter(element => !element.hasAttribute('skip-intro'))
        .map((element, i, { length }) => new Stage({
            intro: `intro.app_${npad(step + 1)}`,
            step: ++step,
            element,
            onchange: () => self.$vuetify.theme.dark || Object.assign(
                dom('.introjs-disableInteraction').style, {
                    boxShadow: 'rgba(255,255,255,.7) 0 0 15px 7px',
                    border: '2px solid black',
                    borderRadius: '4px',
                    opacity: '0.1'
                }
            ),
            ...(i === length - 1 && {
                action: () => new Promise(resolve => {
                    self.$bus.$emit('sidebar:pullout')
                    setTimeout(resolve, 250)
                })
            })
        }))
    ),new Stage({
        step: ++step, // 14
        element: '.chatbot-module.dialogs',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_14',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            self.$bus.$emit('sidebar:restore')

            return new Promise(resolve => {
                self.route === '/chatbot' || (self.route = '/chatbot')
                setTimeout(resolve)

            }).then(() => self.entity('chatbot') !== 'dialogs'
                ? self.swipe('chatbot', 'dialogs')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.chatbot-module.dialogs')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 15
        element: '.connection-module.connections',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_15',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/chatbot' || (self.route = '/chatbot')
                setTimeout(resolve)

            }).then(() => self.entity('chatbot') !== 'connections'
                ? self.swipe('chatbot', 'connections')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.connection-module.connections')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 16
        element: '.chatbot-module.mailing',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_16',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/chatbot' || (self.route = '/chatbot')
                setTimeout(resolve)

            }).then(() => self.entity('chatbot') !== 'mailing'
                ? self.swipe('chatbot', 'mailing')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.chatbot-module.mailing')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 100)
    }),new Stage({
        step: ++step, // 17
        element: '.stream-module.stream',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_17',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/stream' || (self.route = '/stream')
                setTimeout(resolve)

            }).then(() => self.entity('socket') !== 'stream'
                ? self.swipe('socket', 'stream')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.stream-module.stream')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 100)
    }),new Stage({
        step: ++step, // 18
        element: '.stream-module.history',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_18',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/stream' || (self.route = '/stream')
                setTimeout(resolve)

            }).then(() => self.entity('socket') !== 'history'
                ? self.swipe('socket', 'history')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.stream-module.history')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 19
        element: '.stream-module.chart',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_19',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/stream' || (self.route = '/stream')
                setTimeout(resolve)

            }).then(() => self.entity('socket') !== 'chart'
                ? self.swipe('socket', 'chart')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.stream-module.chart')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 100)
    }),new Stage({
        step: ++step, // 20
        element: '.module.widget-text',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_20',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'text'
                ? self.swipe('widget', 'text')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-text')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 100)
    }),new Stage({
        step: ++step, // 21
        element: '.module.widget-list',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_21',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'list'
                ? self.swipe('widget', 'list')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-list')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 22
        element: '.module.widget-table',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_22',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'table'
                ? self.swipe('widget', 'table')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-table')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 23
        element: '.module.widget-tiles',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_23',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'tiles'
                ? self.swipe('widget', 'tiles')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-tiles')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 24
        element: '.module.widget-covers',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_24',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'cover_list'
                ? self.swipe('widget', 'cover_list')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-covers')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 25
        element: '.module.widget-match',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_25',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'match'
                ? self.swipe('widget', 'match')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-match')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 26
        element: '.module.widget-donation',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_26',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/widget' || (self.route = '/widget')
                setTimeout(resolve)

            }).then(() => self.entity('widget') !== 'donation'
                ? self.swipe('widget', 'donation')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.widget-donation')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 100)
    }),new Stage({
        step: ++step, // 27
        element: '.cover-module.covers-list',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_27',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/cover' || (self.route = '/cover')
                setTimeout(resolve)

            }).then(() => self.entity('cover') !== 'list'
                ? self.swipe('cover', 'list')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.cover-module.covers-list')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 100)
    }),new Stage({
        step: ++step, // 28
        element: '.module.connection-module',
        position: 'bottom-middle-aligned',
        intro: 'intro.app_28',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/cover' || (self.route = '/cover')
                setTimeout(resolve)

            }).then(() => self.entity('cover') !== 'connections'
                ? self.swipe('cover', 'connections')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'bottom-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.module.connection-module')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
    }),new Stage({
        step: ++step, // 29
        element: '.cover-module.templates',
        position: 'top-middle-aligned',
        intro: 'intro.app_29',
        scrollTo: 'tooltip',
        action(/* target, tip */) {
            let t, idx = this.step - 1

            return new Promise(resolve => {
                self.route === '/cover' || (self.route = '/cover')
                setTimeout(resolve)

            }).then(() => self.entity('cover') !== 'templates'
                ? self.swipe('cover', 'templates')
                : Promise.resolve()

            ).then(() => new Promise(resolve => {
                self.intro.instance._introItems[idx].position = 'top-middle-aligned'

                run((_, i) => {
                    if ((t = dom('.cover-module.templates')) || i > 120) {
                        self.intro.instance._introItems[idx].element = t
                        return true
                    }
                }).then(() => {
                    setTimeout(resolve, 250)
                })
            }))
        }
        /* onchange: utils.debounce(function(_, tip) {
            // const ref = dom('.introjs-tooltipReferenceLayer'),
                // dis = dom('.introjs-disableInteraction')

            // tip.style.height = '80%'
            // ref.style.height = '80%'
            // dis.style.height = '80%'

        }, 50) */
    }),new Stage({
        step: ++step, // 30
        element: '#canvas-context-menu',
        intro: 'intro.app_30',
        action(target) {
            return new Promise(resolve => {
                self.intro.instance._introItems[this.step - 1].position = 'bottom'
                self.intro.target = target

                self.context = {
                    clientY: self.$screen.height * .4,
                    clientX: self.$screen.width * .55,
                    presentation: true
                }

                setTimeout(resolve, 300)
            })
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 200)
    }),new Stage({
        step: ++step, // 31
        element: null,
        intro: 'intro.app_31'
    })/* ,new Stage({
        step: ++step, // 33
        element: null,
        intro: '',
        action(_, tip) {
            return new Promise(resolve => {
                self.intro.instance.exit(dom('.v-main'), true)
                // self.presentation = 'continue'
                self.route = '/designer'

                setTimeout(resolve, 50)
            })
        }
    }) */]
},{
    cleanup(target, tip, finish = false)
    {
        return new Promise(resolve => {
            safe(() => this.intro.target.classList.remove(this.intro.target.getAttribute('data-rem')))
            safe(() => finish && this.$bus.$emit('sidebar:restore'))
            safe(() => this.calculator = null)
            safe(() => this.context = null)
            resolve()
        })
    },
    activateItem(target, classes)
    {
        if (typeof classes === 'string') {
            target.classList.add(classes)
            target.setAttribute('data-rem', classes)
        }

        this.intro.target = target
    }
})
