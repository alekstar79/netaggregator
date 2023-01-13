<template>
    <div v-bind="$attrs" v-hint.right="hint" :class="`hint ${hint.entity}-${hint.id} theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <slot />
    </div>
</template>

<script>
    export default {
        props: {
            hint: {
                required: true,
                type: Object
            }
        },
        methods: {
            showHint()
            {
                this.$bus.$emit('show:hint', this.hint)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .hint {
        ::v-deep .introjs-hint {
            box-sizing: content-box;
            position: absolute;

            margin: 2px 10px;
            height: 20px;
            width: 20px;

            background: transparent;
            cursor: pointer;

            .introjs-hint-pulse {
                box-sizing: content-box;
                position: absolute;
                height: 10px;
                width: 10px;

                border: 5px solid rgba(255, 255, 255, .7);
                border-radius: 30px;

                transition: all .2s ease-out;
                z-index: 10;
            }
            .introjs-hint-dot {
                box-sizing: content-box;
                position: absolute;
                left: -25px;
                top: -25px;

                height: 50px;
                width: 50px;

                background: transparent;
                border: 10px solid rgba(255, 255, 255, .7);
                border-radius: 60px;

                animation: pulse 3s ease-out;
                animation-iteration-count: infinite;

                z-index: 1;
                opacity: 0;
            }

            &:hover > .introjs-hint-pulse {
                border: 5px solid rgba(150, 150, 150, .5);
            }
            &:focus {
                border: 0;
                outline: 0;
            }
        }
        &.theme--dark {
            ::v-deep .introjs-hint {
                .introjs-hint-pulse {
                    border: 5px solid rgba(210, 210, 210, .6);
                }
                .introjs-hint-dot {
                    border: 10px solid rgba(210, 210, 210, .6);
                }

                &:hover > .introjs-hint-pulse {
                    border: 5px solid rgba(150, 150, 150, .5);
                }
            }
        }
    }
    @keyframes pulse {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        25% {
            transform: scale(0);
            opacity: .1;
        }
        50% {
            transform: scale(.1);
            opacity: .3;
        }
        75% {
            transform: scale(.5);
            opacity: .5;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
</style>
