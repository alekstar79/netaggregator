<template>
    <div class="image-container" :class="{ 'glitch-w': glitch && !mobile, 'glitch-m': false }" :style="style">
        <template v-for="i in range">
            <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="size" :width="size" :key="i">
                <path :fill="fill" d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
            </svg>
        </template>
    </div>
</template>

<script>
    export default {
        props: {
            viewBox: {
                default: '0 0 24 24',
                type: String
            },
            size: {
                default: '100%',
                type: [Number, String]
            },
            fill: {
                default: '#000',
                type: String
            },
            glitch: {
                default: false,
                type: Boolean
            }
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            range() {
                return this.glitch && !this.mobile ? 3 : 1
            },
            style() {
                return { height: '100%', width: '100%' }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .image-container {
        position: relative;

        &.glitch-m {
            @include svgGlitch(#CFCFCF, 'rgba(0,0,0,0)', #CFCFCF, #F5F5F5, 100%, 100%, 0, 0)
        }
        &.glitch-w {
            @include svgGlitch(#CFCFCF, #F5F5F5, #CFCFCF, #F5F5F5, 100%, 100%, 0, 0)
        }
        & > svg {
            position: absolute;
            height: 100%;
            width: 100%;
            left: 0;
            top: 0;
        }
    }
</style>
