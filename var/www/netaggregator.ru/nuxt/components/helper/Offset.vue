<template>
    <div class="v-offset" :class="{ 'v-offset--full-width': fullWidth }" :style="styles">
        <slot />
    </div>
</template>

<script>
    export default {
        props: {
            offset: {
                type: [Number, String],
                default: 0
            },
            fullWidth: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            styles() {
                return {
                    marginBottom: `-${this.offset}px`,
                    top: `-${this.offset}px`
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .v-offset {
        margin: 0 auto;
        max-width: calc(100% - 32px);
        position: relative;

        &.v-offset--full-width {
            width: 100%;
        }
    }
</style>
