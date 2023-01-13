<template>
    <section v-scroll="onScroll" class="cta-two">
        <!--<img src="/img/starter/shapes/cta-2-shape-1.png" alt="" class="cta-two__shape-1">-->
        <!--<img src="/img/starter/shapes/cta-2-shape-2.png" alt="" class="cta-two__shape-2">-->
        <!--<img src="/img/starter/shapes/cta-2-shape-3.png" alt="" class="cta-two__shape-3">-->

        <svg xmlns="http://www.w3.org/2000/svg" width="178" height="178" class="cta-two__shape-1">
            <defs>
                <pattern id="hatch-shape-1" width="12" height="12" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
                    <line stroke="#2FB5DC" stroke-width="5" x1="0" y1="0" x2="0" y2="12" />
                </pattern>
            </defs>

            <circle cx="89" cy="89" r="89" fill="url(#hatch-shape-1)" />
        </svg>

        <div class="container">
            <img src="/img/starter/feature_here_2.png" alt="discover tools" class="cta-two__moc">

            <div class="row">
                <div class="col-xl-5 col-lg-6">
                    <div class="cta-two__content">
                        <div class="block-title text-left">
                            <span class="block-title__bubbles" />
                            <p>{{ $t('zimed.crucial_aspects') }}</p>
                            <h3>{{ $t('zimed.convenient_tools') }}</h3>
                        </div>

                        <p>
                            {{ $t('zimed.harmony_interface') }}
                        </p>

                        <!--<a @click.stop="" class="thm-btn cta-two__btn">
                            {{ $t('zimed.discover_more') }}
                        </a>-->
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import { getCoords } from '~/utils/common/coords.mjs'

    export default {
        data: () => ({
            min: 0,
            max: 0
        }),
        watch: {
            '$store.state.app.window': 'positioning'
        },
        methods: {
            positioning()
            {
                const { top, height } = getCoords(this.$el)

                this.max = top + height
                this.min = top
            },
            emitVisibility(data)
            {
                this.$bus.$emit('scroll:goal', { id: 'features', ...data })
            },
            onScroll(event)
            {
                const offsetTop = event.target.scrollingElement.scrollTop

                if (offsetTop > this.min && offsetTop < this.max) {
                    this.emitVisibility({ min: this.min, max: this.max })
                }
            }
        },
        mounted()
        {
            this.$nextTick().then(this.positioning)
        }
    }
</script>
