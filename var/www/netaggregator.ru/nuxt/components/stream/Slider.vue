<template>
    <div class="chart-slider" @mousedown="mouseDown">
        <canvas ref="slider" />

        <div data-el="left" class="chart-slider__left">
            <div data-el="arrow" class="chart-slider__arrow--left" data-type="left" />
        </div>

        <div data-el="window" class="chart-slider__window" data-type="window" />

        <div data-el="right" class="chart-slider__right">
            <div data-el="arrow" class="chart-slider__arrow--right" data-type="right" />
        </div>
    </div>
</template>

<script>
    // import { SliderChart } from '~/utils/chart/slider'
    // import themes from '~/utils/chart/themes'

    export default {
        props: {
            options: {
                type: Object,
                required: true
            }
        },
        computed: {
            styles() {
                return themes[this.options.theme || 'light']
            }
        },
        watch: {
            styles: 'updateTheme',

            options: {
                deep: true,
                handler: 'resize'
            }
        },
        data() {
            const labels = this.options.data.datasets.map(set => set.name)

            return {
                labels: labels.concat(),
                slider: null,

                prevState: {
                    labels: labels.concat(),
                    right: 0,
                    left: 0
                }
            }
        },
        methods: {
            updateTheme()
            {
                this.slider && this.slider.updateTheme(this.styles)
            },
            resize({ data })
            {
                this.slider && this.slider.resize({ ...data, height: 40 })
                this.slider && this.slider.render()
            },
            getData()
            {
                const fn = set => this.labels.includes(set.name),
                    { data } = this.options

                return {
                    datasets: data.datasets.filter(fn),
                    labels: data.labels.concat()
                }
            },
            shouldChartUpdate()
            {
                const [left, right] = (this.slider?.position || [0, 0])

                return this.prevState.labels.length !== this.labels.length ||
                    this.prevState.right !== right ||
                    this.prevState.left !== left
            },
            updateChart()
            {
                if (!this.shouldChartUpdate()) return

                const [left, right] = (this.slider?.position || [0, 0])

                this.prevState = {
                    labels: this.labels.concat(),
                    right,
                    left
                }
            },
            init()
            {
                const { data, width = 650 } = this.options

                this.slider = new SliderChart({
                    el: this.$refs.slider,
                    onUpdate: this.updateChart,
                    theme: this.styles,
                    height: 40,
                    width,
                    data
                })

                this.updateTheme()
                this.updateChart()
            },
            mouseDown(e)
            {
                this.slider && this.slider.mouseDownHandler(e)
            },
            mouseUp(e)
            {
                this.slider && this.slider.mouseUpHandler(e)
            }
        }
        /* beforeDestroy()
        {
            document.removeEventListener('mouseup', this.mouseUp)

            this.slider.destroy()
        },
        beforeMount()
        {
            document.addEventListener('mouseup', this.mouseUp)
        },
        mounted()
        {
            this.$nextTick().then(this.init.bind(this))
        } */
    }
</script>

<!--<style lang="scss" scoped>
    .chart-slider {
        position: relative;
        margin-bottom: .5rem;
        z-index: 1;

        &__right, &__left {
            position: absolute;
            bottom: 0;
            top: 0;

            transition: background .22s ease-in-out;
            background: #f5f9fb;
            opacity: .8;
        }
        &__left {
            left: 0;
        }
        &__right {
            right: 0;
        }
        &__arrow--left, &__arrow--right {
            position: absolute;
            bottom: 0;
            top: 0;

            transition: background .22s ease-in-out;
            background: #ddeaf3;
            width: 4px;
        }
        &__arrow--left {
            right: 0;
            cursor: w-resize;
        }
        &__arrow--right {
            left: 0;
            cursor: e-resize;
        }
        &__window {
            position: absolute;
            background: transparent;
            bottom: 0;
            top: 0;
        }
    }
</style>-->
