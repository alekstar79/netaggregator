<template>
    <section v-scroll="onScroll" id="faq" class="faq-one">
        <!--<img src="/img/starter/shapes/faq-shape-1.png" class="faq-one__shape-1" alt="">-->
        <!--<img src="/img/starter/shapes/faq-shape-2.png" class="faq-one__shape-2" alt="">-->
        <!--<img src="/img/starter/shapes/faq-shape-3.png" class="faq-one__shape-3" alt="">-->

        <svg xmlns="http://www.w3.org/2000/svg" width="320" height="294" class="faq-one__shape-1">
            <defs>
                <pattern id="hatch-shape-3" width="6" height="6" patternUnits="userSpaceOnUse">
                    <line stroke="#FC8289" stroke-width="3" x1="0" y1="0" x2="0" y2="6" />
                </pattern>
            </defs>

            <path fill="url(#hatch-shape-3)" stroke="none" transform="rotate(33,112,214)" d="m5.154637,80.231226c0,0 -9.730671,-25.563857 11.92188,-52.604741c13.942685,-20.1427 32.722293,-27.738811 58.432669,-22.723429c8.667515,1.769177 23.795078,11.621415 30.433682,27.998511c4.203909,17.594423 7.13773,35.967945 18.657884,52.349103c9.897024,13.524488 20.556925,18.921311 32.064919,19.87894c17.598784,0.953569 34.743094,-0.969811 52.751715,-10.144388c20.029426,-14.056065 41.243718,-8.667364 51.128586,-4.057755c19.217863,9.88469 29.476027,29.475535 29.622117,52.345043c2.580785,31.796569 -7.044391,48.952758 -23.941163,63.706758c-19.737249,14.754 -35.043377,14.056062 -53.157498,6.086633c-21.36038,-10.404082 -34.637593,-15.565551 -55.592192,-12.173266c-15.273645,2.174959 -26.927726,12.027184 -32.202897,24.606225c-8.103487,15.829306 -2.467124,27.621159 -16.085211,47.621818c-15.695644,14.721517 -30.157769,16.068696 -50.057322,16.490713c-35.30307,-1.217327 -47.444113,-29.585068 -46.518895,-56.66249c1.339108,-23.323929 15.647003,-41.486458 40.537706,-51.906783c20.820718,-14.453717 13.699162,-39.133014 4.110521,-45.889179c-7.559729,-8.793164 -20.451419,-8.63082 -30.466111,-17.001967c-16.95353,-12.48575 -19.209749,-27.418309 -21.64039,-37.919746z" />
        </svg>

        <div class="container">
            <div class="block-title text-center">
                <span class="block-title__bubbles" />

                <p>{{ $t('zimed.faq') }}</p>

                <p class="special__title">
                    {{ $t('zimed.any_question') }}
                </p>
            </div>

            <div v-wow class="accrodion-grp faq-accrodion wow fadeIn" data-wow-duration="1500ms" ref="accrodion">
                <div v-for="({ title, text, active }, i) in accrodions" class="accrodion" :class="{ active }" :key="i">
                    <div class="accrodion-inner">
                        <div class="accrodion-title" @click="onClick(i)">
                            <h4>{{ $t(`zimed.${title}`) }}</h4>
                        </div>

                        <lazy-helper-slide-up-down :active="active" class="accrodion-content">
                            <div class="inner"><p>{{ $t(`zimed.${text}`) }}</p></div>
                        </lazy-helper-slide-up-down>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import { getCoords } from '~/utils/common/coords.mjs'
    import { wow } from '~/directives/wow'

    export default {
        directives: {
            wow
        },
        data: () => ({
            accrodions: [
                { title: 'whatisit_title', text: 'whatisit_text', active: false },
                { title: 'dcover_title',   text: 'dcover_text',   active: false },
                { title: 'widget_title',   text: 'widget_text',   active: false },
                { title: 'chatbot_title',  text: 'chatbot_text',  active: false },
                { title: 'stream_title',   text: 'stream_text',   active: false }
            ],

            min: 0,
            max: 0
        }),
        watch: {
            '$store.state.app.window': 'positioning'
        },
        methods: {
            emitVisibility(data)
            {
                this.$bus.$emit('scroll:goal', { id: 'faq', ...data })
            },
            onScroll(event)
            {
                const offsetTop = event.target.scrollingElement.scrollTop

                if (offsetTop > this.min && offsetTop < this.max) {
                    this.emitVisibility({ min: this.min, max: this.max })
                }
            },
            onClick(idx)
            {
                const state = this.accrodions[idx].active

                this.accrodions.forEach(a => a.active = false)
                this.accrodions[idx].active = !state
            },
            positioning()
            {
                const { top, height } = getCoords(this.$el)

                this.max = top + height
                this.min = top
            }
        },
        mounted()
        {
            this.$nextTick().then(this.positioning)
        }
    }
</script>

<style lang="scss" scoped>
    .faq-one .container {
        p.special__title {
            margin: 0;
            font-weight: 800;
            font-size: 2.8em;
            color: #000000;
        }
    }
</style>
