import introWrapper, { Stage, dom, safe, utils } from '../common/intro.js'

export default introWrapper(function(self)
{
    self.intro.options.showBullets = false
    self.intro.autoRefresh = false

    let step = 0

    return [new Stage({
        step: ++step, // 1
        element: '.image-editor',
        title: 'Welcome!',
        intro: 'intro.designer_01',
        action(/* target, tip */) {
            return new Promise(resolve => {
                self.intro.hold && self.intro.hold.classList.remove('down')
                setTimeout(resolve, 250)
            })
        }
    }),new Stage({
        step: ++step, // 2
        element: '.image-editor__topbar',
        intro: 'intro.designer_02',
        action(target/* , tip */) {
            return new Promise(resolve => {
                self.presentation = true

                self.$refs.menu.hideBlock(0)
                self.activateItem(target, 'down')

                setTimeout(resolve, 250)
            })
        }
    }),new Stage({
        step: ++step, // 3
        element: null,
        intro: 'intro.designer_03',
        action(target/* , tip */) {
            const idx = this.step - 1

            return self.$refs.menu.viewBlock(0)
                .then(() => new Promise(resolve => {
                    target = dom('.top-menu.file')

                    self.intro.instance._introItems[idx].element = target
                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.hold = dom('.image-editor__topbar')
                    self.intro.hold.classList.add('down')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 4
        element: null,
        intro: 'intro.designer_04',
        action(target/* , tip */) {
            const idx = this.step - 1

            return self.$refs.menu.viewBlock(1)
                .then(() => new Promise(resolve => {
                    target = dom('.top-menu.edit')

                    self.intro.instance._introItems[idx].element = target
                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.hold = dom('.image-editor__topbar')
                    self.intro.hold.classList.add('down')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 5
        element: null,
        intro: 'intro.designer_05',
        action(target/* , tip */) {
            const idx = this.step - 1

            return self.$refs.menu.viewBlock(2)
                .then(() => new Promise(resolve => {
                    target = dom('.top-menu.image')

                    self.intro.instance._introItems[idx].element = target
                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.hold = dom('.image-editor__topbar')
                    self.intro.hold.classList.add('down')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 6
        element: null,
        intro: 'intro.designer_06',
        action(target/* , tip */) {
            const idx = this.step - 1

            return self.$refs.menu.viewBlock(3)
                .then(() => new Promise(resolve => {
                    target = dom('.top-menu.layer')

                    self.intro.instance._introItems[idx].element = target
                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.hold = dom('.image-editor__topbar')
                    self.intro.hold.classList.add('down')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 7
        element: null,
        intro: 'intro.designer_07',
        action(target) {
            const idx = this.step - 1

            return self.$refs.menu.viewBlock(4)
                .then(() => new Promise(resolve => {
                    target = dom('.top-menu.tools')

                    self.intro.instance._introItems[idx].element = target
                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.hold = dom('.image-editor__topbar')
                    self.intro.hold.classList.add('down')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 8
        element: null,
        intro: 'intro.designer_08',
        action(target) {
            const idx = this.step - 1

            return self.$refs.menu.viewBlock(5)
                .then(() => new Promise(resolve => {
                    target = dom('.top-menu.help')

                    self.intro.hold && self.intro.hold.classList.remove('visible')
                    self.intro.instance._introItems[idx].element = target
                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.hold = dom('.image-editor__topbar')
                    self.intro.hold.classList.add('down')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 9
        element: '.image-list',
        intro: 'intro.designer_09',
        position: 'top',
        action(target) {
            return new Promise(resolve => {
                self.intro.hold && self.intro.hold.classList.remove('down')
                self.$refs.sticker.hideBlock(0)
                self.$refs.menu.hideBlock(5)

                self.activateItem(target, 'visible')

                setTimeout(resolve, 250)
            })
        }
    }),new Stage({
        step: ++step, // 10
        element: null,
        intro: 'intro.designer_10',
        action(target) {
            const idx = this.step - 1

            return self.$refs.sticker.viewBlock(0)
                .then(() => new Promise(resolve => {
                    target = dom('.bottom-menu.wdg')

                    self.intro.instance._introItems[idx].position = 'right'
                    self.intro.instance._introItems[idx].element = target
                    self.intro.hold = dom('.image-list')
                    self.intro.hold.classList.add('visible')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 11
        element: null,
        intro: 'intro.designer_11',
        action(target) {
            const idx = this.step - 1

            return self.$refs.sticker.viewBlock(1)
                .then(() => new Promise(resolve => {
                    target = dom('.bottom-menu.png')

                    self.intro.instance._introItems[idx].position = 'right'
                    self.intro.instance._introItems[idx].element = target
                    self.intro.hold = dom('.image-list')
                    self.intro.hold.classList.add('visible')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 12
        element: null,
        intro: 'intro.designer_12',
        action(target) {
            const idx = this.step - 1

            return self.$refs.sticker.viewBlock(2)
                .then(() => new Promise(resolve => {
                    target = dom('.bottom-menu.svg')

                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.instance._introItems[idx].element = target
                    self.intro.hold = dom('.image-list')
                    self.intro.hold.classList.add('visible')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 13
        element: null,
        intro: 'intro.designer_13',
        action(target) {
            const idx = this.step - 1

            return self.$refs.sticker.viewBlock(3)
                .then(() => new Promise(resolve => {
                    target = dom('.bottom-menu.set')

                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.instance._introItems[idx].element = target
                    self.intro.hold = dom('.image-list')
                    self.intro.hold.classList.add('visible')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 14
        element: null,
        intro: 'intro.designer_14',
        action(target) {
            const idx = this.step - 1

            return self.$refs.sticker.viewBlock(4)
                .then(() => new Promise(resolve => {
                    target = dom('.bottom-menu.bgd')

                    self.intro.instance._introItems[idx].position = 'left'
                    self.intro.instance._introItems[idx].element = target
                    self.intro.hold = dom('.image-list')
                    self.intro.hold.classList.add('visible')

                    setTimeout(resolve, 250)
                }))
        }
    }),new Stage({
        step: ++step, // 15
        element: '.tool-wrapper.left',
        intro: 'intro.designer_15',
        position: 'right',
        correction: {
            height: 'calc({0} + 2%)',
            top: 'calc({0} - 1.5%)'
        },
        action(target) {
            return new Promise(resolve => {
                self.intro.hold && self.intro.hold.classList.remove('visible')
                self.$refs.sticker.hideBlock(4)

                self.activateItem(target, 'visible')

                setTimeout(resolve, 250)
            })
        }
    }),new Stage({
        step: ++step, // 16
        element: '.tool-wrapper.right',
        intro: 'intro.designer_16',
        position: 'left',
        correction: {
            height: 'calc({0} + 2%)',
            top: 'calc({0} - 1.5%)'
        },
        action(target) {
            return new Promise(resolve => {
                self.activateItem(target, 'visible')
                setTimeout(resolve, 250)
            })
        }
    }),new Stage({
        step: ++step, // 17
        element: '#canvas-context-menu',
        intro: 'intro.designer_17',
        action(target) {
            return new Promise(resolve => {
                self.intro.instance._introItems[this.step - 1].position = 'bottom'
                self.intro.target = target

                self.$refs.context.show({
                    clientY: self.$screen.height * .4,
                    clientX: self.$screen.width * .55,
                    presentation: true
                })

                setTimeout(resolve, 250)
            })
        },
        onchange: utils.debounce(function() {
            self.intro.instance.refresh(true)

        }, 10)
    }),new Stage({
        step: ++step, // 18
        element: null,
        intro: 'intro.designer_18',
        action() {
            return self.setCanvas({ width: 480,  height: 360 })
                .then(() => new Promise(resolve => {
                    const target = dom('.rg-overlay')

                    self.zoom(-.5)
                    self.intro.instance._introItems[this.step - 1].element = target
                    self.intro.target = target

                    setTimeout(resolve, 250)
                }))
        }
    })]
},{
    cleanup()
    {
        return new Promise(resolve => {
            safe(() => this.intro.target.classList.remove(this.intro.target.getAttribute('data-rem')))
            safe(() => this.$refs.context.hide())
            safe(() => this.discharge(4))
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
