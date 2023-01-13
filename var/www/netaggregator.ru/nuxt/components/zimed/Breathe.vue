<!--suppress StatementWithEmptyBodyJS, JSUnusedLocalSymbols, CssInvalidAtRule -->
<template lang="pug">
.wrapper
    - let p = 3, n = 7;
    - let m = n * n;

    style
        - for(let i = 0; i < n; i++)
            | .tile:nth-child(#{n}n + #{i + 1}) { --x: #{i} }
            | .tile:nth-child(n + #{n*i + 1}) { --y: #{i} }
    .cube(:class="{ vkapp }" style=`--n: ${n}` @mouseenter="play = false" @mouseleave="play = true" ref="cube")
        - for(let i = 0; i < p; i++)
            .face(style=i < p - 1 ? `--f: ${i}` : null)
                - for(let j = 0; j < m; j++)
                    .tile
</template>

<script>
    export default {
        computed: {
            vkapp() {
                return !!this.$store.state.app.vkapp
            }
        },
        watch: {
            play(v) {
                const action = this.animation && v ? 'play' : 'pause'

                this.cubeAnimations.forEach(a => {
                    a[action]()
                })
            },
            animation(v) {
                const action = v ? 'play' : 'pause'

                this.cubeAnimations.forEach(a => {
                    a[action]()
                })
            }
        },
        data: () => ({
            cubeAnimations: [],
            animation: true,
            play: false
        }),
        methods: {
            pause(v)
            {
                this.animation = !v
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('animation:pause', this.pause)
        },
        async beforeMount()
        {
            this.$bus.$on('animation:pause', this.pause)

            try {

                this.animation = await this.$ls.get('zimed:animation', true)

            } catch (e) {
            }
        },
        async mounted()
        {
            await this.$nextTick()

            this.cubeAnimations = this.$refs.cube.getAnimations({ subtree: true })
            this.play = true
        }
    }
</script>

<style lang="scss" scoped>
    $l: 2em; /* size */
    $sf: .2; /* scale factor */
    $s0: 0 0 2px 1px currentcolor;
    $s1: 0 0 1px 1px rgba(#787878, .5);
    $t: 3s;

    @property --ty {
        syntax: '<length-percentage>';
        initial-value: 0%;
        inherits: false
    }
    @property --ay {
        syntax: '<angle>';
        initial-value: -45deg;
        inherits: false
    }
    @property --q {
        syntax: '<integer>';
        initial-value: 0;
        inherits: false
    }

    .wrapper {
        display: grid;
        position: absolute;
        right: 0;

        div {
            display: grid;
            transform-style: preserve-3d;
        }
        .cube {
            margin-top: 90px;
            place-self: center;
            transform:
                translatey(var(--ty, 0))
                rotatex(-35deg)
                rotatey(calc(var(--ay, -45deg) - var(--q, 0) * 90deg));
            animation:
                ty $t ease-in-out infinite alternate,
                ay 2 * $t ease-in-out infinite,
                q 2 * $t steps(1) infinite;

            &.vkapp {
                margin-right: 60px;
            }
        }
        .face {
            --i: 0;
            --j: calc(1 - var(--i));
            grid-area: 1 / 1;
            grid-template: repeat(var(--n), $l)/ repeat(var(--n), $l);
            transform:
                rotate3d(var(--i), var(--j), 0, calc(var(--f, 1) * 90deg))
                translatez(calc(.5 * var(--n) * #{$l}));

            &:last-child { --i: 1 }
        }
        .tile {
            --m: calc(.5 * (var(--n) - 1));
            --dx: max(var(--m) - var(--x), var(--x) - var(--m));
            --dy: max(var(--m) - var(--y), var(--y) - var(--m));
            --dt: calc((
            var(--j) * (.5 * (var(--dx) + var(--y) + var(--m)) / var(--m) - 2) +
            var(--i) * (.5 * (var(--dx) + var(--dy)) / var(--m) - 2)) * #{$t});
            backface-visibility: hidden;
            border-radius: 5px;
            box-shadow: $s1, inset $s1,  $s0, inset $s0;
            background: rgba(255, 255, 255, .5);
            color: fuchsia;
            animation: a 0s var(--dt) infinite alternate;
            animation-name: m, c;
            animation-duration: .5 * $t, $t;
            animation-timing-function: ease-in-out, linear
        }
    }

    @keyframes ty { to { --ty: 12.5% } }
    @keyframes ay { to { --ay: 45deg } }
    @keyframes q { 50% { --q: 1 } }

    @keyframes m {
        to {
            transform: translatez(.5 * ($sf - 1) * $l) scale($sf)
        }
    }
    @keyframes c {
        to { color: aqua }
    }

    @media(max-width: 991px) {
        .wrapper .cube {
            margin-right: -90px;
            margin-top: 150px;
        }
    }
    @media(max-width: 768px) {
        .wrapper .cube {
            margin-right: -230px;
            margin-top: 170px;
        }
    }
</style>
