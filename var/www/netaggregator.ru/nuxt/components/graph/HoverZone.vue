<template>
    <div @mouseleave="$emit('hover', { position, state: leave })"
        @mouseenter="$emit('hover', { position, state: true })"
        @click="$emit('hover', { position, state: true })"
        :style="{ [param]: `calc(${size} + 20px)` }"
        :[clickBehavior]="'prevent'"
        :class="position"
        class="hover-zone"
    />
</template>

<script>
    export default {
        props: {
            position: {
                required: true,
                type: String
            },
            size: {
                type: [Number, String],
                required: true
            }
        },
        computed: {
            clickBehavior() {
                return 'click-behavior'
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            leave() {
                const { position, mobile, $store: { state } } = this

                return !mobile && state.canvas.fixed && ['bottom', 'top'].includes(position)
            },
            param() {
                let param

                switch (this.position) {
                    case 'right':
                    case 'left':
                        param = 'min-height'
                        break

                    case 'bottom':
                    case 'top':
                        param = 'min-width'
                        break
                }

                return param
            }
        }
    }
</script>

<style lang="scss" scoped>
    .hover-zone {
        position: absolute;
        padding: 25px;
        z-index: 97;

        &.top {
            top: 0;
            left: 50%;
            transform: translateX(-50%);
        }
        &.bottom {
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
        }
        &.right {
            right: 0;
            top: 50%;
            transform: translateY(-52%);
        }
        &.left {
            left: 0;
            top: 50%;
            transform: translateY(-52%);
        }
    }
</style>
