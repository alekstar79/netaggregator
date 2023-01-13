<script>
    export default {
        inheritAttrs: true,

        props: {
            run: {
                type: Boolean,
                default: false
            },
            tag: {
                type: String,
                default: 'div'
            },
            start: {
                default: 0
            },
            end: {
                default: 0
            },
            duration: {
                default: 2000
            },
            thousand: {
                type: String,
                default: ' '
            }
        },
        data: () => ({
            startData: null,
            endData: null,

            durationData: null,
            numberToSum: null,

            value: null
        }),
        methods: {
            numberWithCommas(value, thousand)
            {
                /*
                todo: SyntaxError: Invalid regular expression: invalid group specifier name
                     (the error occurs only on safari ios)
                */
                return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, thousand)
            },
            perform()
            {
                const frameDuration = 1000 / 60
                const totalFrames = Math.round(this.duration / frameDuration)
                const easeOutQuad = t => t * (2 - t)

                let increasing = true

                if (this.startData > this.endData) {
                    typeof this.endData === 'undefined' && (this.endData = 0)
                } else {
                    increasing = false
                    typeof this.startData === 'undefined' && (this.startData = 0)
                }

                let frame = 0
                let countTo = this.endData - this.startData

                if (countTo < 0) {
                    countTo *= -1
                }

                const counter = setInterval(() => {
                    frame++

                    const progress = easeOutQuad(frame / totalFrames)
                    const currentCount = Math.round(countTo * progress)

                    if (parseInt(this.value, 10) !== currentCount) {
                        this.value = this.numberWithCommas(
                            increasing ? this.startData + currentCount : this.startData + currentCount,
                            this.thousand
                        )
                    }
                    if (frame === totalFrames) {
                        clearInterval(counter)
                    }

                }, frameDuration)
            }
        },
        render(h)
        {
            return h(this.tag, this.$attrs, [this.value])
        },
        created()
        {
            this.durationData = parseInt(this.duration)
            this.startData = parseInt(this.start)
            this.endData = parseInt(this.end)

            this.value = this.startData

            if (this.startData !== this.endData) {
                const unwatch = this.$watch('run', () => {
                    this.perform()

                    if (typeof unwatch === 'function') {
                        unwatch()
                    }
                })
            }
        }
    }
</script>
