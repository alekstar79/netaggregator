<!--suppress CssInvalidAtRule -->
<!--<template lang="pug">
.wrapper
    .cube(@mouseenter="play = false" @mouseleave="play = true" ref="cube")
        - for(let k = 0; k < 6; k++)
            .face(style=`--m: ${k < 4 ? k : (-1)**k}`)
</template>-->
<template>
    <div class="wrapper">
        <div @mouseenter="play = false" @mouseleave="play = true" class="cube" ref="cube">
            <div v-for="k in 6" class="face" :style="`--m: ${k < 5 ? k - 1 : (-1)**(k - 1)}`" :key="k" />
        </div>
    </div>
</template>

<script>

    const cubeAnimation = { play: () => {}, pause: () => {} }

    /**
    * @see https://badcode.ru/kak-nastroit-rabotu-s-pug-v-vue-shablonakh
    * @see https://developer.mozilla.org/ru/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
    * @see https://habr.com/ru/company/ruvds/blog/354438
    * @see https://habr.com/ru/post/486454
    */
    export default {
        props: {
            animation: {
                type: Boolean,
                default: true
            }
        },
        watch: {
            play(v) {
                this.cubeAnimation[this.animation && v ? 'play' : 'pause']()
            },
            animation(v) {
                this.cubeAnimation[v ? 'play' : 'pause']()
            }
        },
        data: () => ({
            cubeAnimation,
            play: false
        }),
        mounted()
        {
            this.$nextTick().then(() => {
                this.cubeAnimation = this.$refs.cube.animate(
                    [
                        { transform: 'rotatex(0) rotatey(0) rotate(0)' },
                        { transform: 'rotatex(1turn) rotatey(-1turn) rotate(1turn)' }
                    ],
                    {
                        duration: 10000,
                        iterations: Infinity,
                        fill: 'forwards',
                        easing: 'linear'
                    }
                )

                this.play = true
            })
        }
    }
</script>

<style lang="scss" scoped>
    $r: 25px; // cube inradius (4vmax)
    $c: teal, purple, tomato, gold, yellowgreen, mediumaquamarine;
    $d: 12.5%;
    $f: 1.5 * $d;
    $s: 50%; // mask size

    @property --p {
        syntax: '<number>';
        initial-value: 0;
        inherits: false
    }

    .wrapper {
        position: absolute;
        height: 100%;
        width: 100%;

        perspective: 80em;

        div { position: absolute }

        .cube {
            top: -65px; /*-30px;*/
            right: 50px;

            transform-style: preserve-3d;
            // animation: rotate 10s infinite linear;

            &:hover {
                /*
                * not work when intercepting control from js
                * document.getAnimations()
                */
                animation-play-state: paused
            }
        }
        .face {
            --i: 0;
            --j: calc(1 - var(--i));
            --p: 0;
            margin: -$r;
            padding: $r;
            transform:
                rotate3d(var(--i), var(--j), 0, calc(var(--m) * 90deg))
                translatez($r) rotatey(calc(var(--m) * var(--j) * 0.5turn));
            background: conic-gradient($c, nth($c, 1));
            --mask:
                repeating-radial-gradient(red calc((var(--p) - 1) * #{$f}),
                    transparent calc((var(--p) - 1) * #{$f} + 1px)
                    calc((var(--p) - 1) * #{$f} + #{$d}),
                    red calc((var(--p) - 1) * #{$f} + #{$d} + 1px)
                    calc(var(--p) * #{$f})) 50% / #{$s $s};
            -webkit-mask: var(--mask);
            mask: var(--mask);
            animation: progress 1s linear infinite;

            &:nth-child(n + 5) { --i: 1 }
        }
    }

    /* @keyframes rotate {
        to { transform: rotatex(1turn) rotatey(-1turn) rotate(1turn) }
    } */

    @keyframes progress { to { --p: 1 } }

    @media(max-width: 1320px) {
        .wrapper .cube {
            right: 90px;
        }
    }
</style>
