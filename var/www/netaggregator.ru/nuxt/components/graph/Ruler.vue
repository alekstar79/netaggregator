<script>
    import { mapState } from 'vuex'

    function coords(e)
    {
        return {
            x: typeof e.clientX !== 'undefined' ? e.clientX : e.touches[0].clientX,
            y: typeof e.clientY !== 'undefined' ? e.clientY : e.touches[0].clientY
        }
    }

    export default {
        props: {
            type: {
                required: true,
                type: String
            }
        },
        computed: {
            ...mapState('canvas', ['origin','scaled']),
            ...mapState('app', ['color']),

            eventsDetermine() {
                return this.mobile
                    ? { start: 'touchstart', move: 'touchmove', end: 'touchend' }
                    : { start: 'mousedown',  move: 'mousemove', end: 'mouseup' }
            },
            themeClasses() {
                return {
                    [`theme--${this.$vuetify.theme.dark ? 'dark' : 'light'}`]: true,
                    [this.color]: true
                }
            },
            class() {
                return { unselectable: true, ruler: true, [this.type]: true, ...this.themeClasses }
            },
            step() {
                return this.scaledSize ? this.scaledSize / this.count : 1
            },
            originSize() {
                const { height = 0, width = 0 } = this.origin || {}

                return this.type === 'v' ? height : width
            },
            scaledSize() {
                const { height = 0, width = 0 } = this.scaled || {}

                return this.type === 'v' ? height : width
            },
            count() {
                return this.originSize ? this.originSize / 10 : 1
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        methods: {
            label(i)
            {
                return { l10: i < 50, l100: i >= 50 && i < 500, l1000: i >= 500 }
            },
            createGuide(e)
            {
                const { x: clientX, y: clientY } = coords(e)

                this.$store.commit('canvas/createGuide', {
                    evt: { clientX, clientY },
                    type: this.type,
                    set: null
                })
            }
        },
        render(createElement)
        {
            let { start } = this.eventsDetermine,
                length = Math.ceil(this.count),
                edge = length < 1000 ? length - 3 : length - 5,
                px = 0

            return createElement('div', {
                on: { [start]: this.createGuide },
                class: this.class

            }, Array.from({ length }, (_, i) => {
                const data = { style: {} }, children = []

                if (i > 0) {
                    px += this.step - 1
                }
                if (i % 10 === 0) {
                    data.class = 'milestone'

                    if (i > 0) {
                        children.push(createElement('span', {
                            class: ['label track', this.label(i)]
                        }, this.type === 'v' || i <= edge ? i * 10 : []))
                    }
                } else if (i % 5 === 0) {
                    data.class = 'major'
                } else {
                    data.class = 'common'
                }

                data.class += ' track'

                data.style[this.type === 'h' ? 'left' : 'top'] = px + 'px'

                return createElement('span', data, children)
            }))
        }
    }
</script>

<style lang="scss" scoped>
    .ruler {
        position: absolute;
        display: flex;

        background-color: #ccc;

        &.unselectable {
            user-select: none;
        }
        span {
            position: relative;
            align-self: flex-end;

            &.label {
                position: absolute;
                border: 0 !important;

                text-align: center;
                font-size: 9px;
                color: #000;
            }
        }
        &.h {
            flex-direction: row;

            top: -31px;
            padding-top: 17px;
            width: 100%;

            border-bottom: solid 1px #000;

            box-shadow:
                rgba(50,50,50,.3) -2px 0px 2px,
                rgba(50,50,50,.3) 2px 0px 2px -1px;

            span {
                border-left: solid 1px #999;
                height: 7px;

                &.milestone {
                    border-left: solid 1px #000;
                    height: 13px;
                }
                &.major {
                    border-left: solid 1px #000;
                    height: 10px;
                }
                &.label {
                    top: -14px;
                    transform: translateX(-50%);
                }
            }

            &.theme--dark {
                box-shadow:
                    rgba(0,0,0,.3) -2px 0px 2px,
                    rgba(0,0,0,.3) 2px 0px 2px -1px;

                span {
                    border-left: solid 1px #000;
                }
            }
        }
        &.v {
            flex-direction: column;

            left: -39px;
            padding-left: 23px;
            height: 100%;

            border-right: solid 1px #000;

            box-shadow:
                rgba(50,50,50,.3) -2px 0px 2px,
                rgba(50,50,50,.3) 0px 2px 2px 0px;

            .l10 {
                left: -17px;
            }

            .l100 {
                left: -17px
            }
            .l1000 {
                left: -23px
            }

            span {
                border-top: solid 1px #999;
                width: 7px;

                &.milestone {
                    border-top: solid 1px #000;
                    width: 15px;
                }
                &.major {
                    border-top: solid 1px #000;
                    width: 10px;
                }
                &.label {
                    transform: translateY(-50%);
                }
            }

            &.theme--dark {
                box-shadow:
                    rgba(0,0,0,.3) -2px 0px 2px,
                    rgba(0,0,0,.3) 0px 2px 2px 0px;

                span {
                    border-top: solid 1px #000;
                }
            }
        }
    }
</style>
