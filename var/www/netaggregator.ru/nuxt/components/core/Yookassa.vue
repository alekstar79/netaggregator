<template>
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height" :width="width" class="yookassa__logo">
        <defs>
            <linearGradient id="paint0_linear" x1="24.437" y1="0" x2="24.437" y2="27" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#0160D1" />
                <stop offset="1" stop-color="#00479C" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="5.46835" y1="3.93042" x2="5.46835" y2="23.5823" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#0160D1" />
                <stop offset="1" stop-color="#00479C" />
            </linearGradient>
        </defs>

        <path class="brand" :stroke="stroke" d="M24.4365 0c-7.519 0-13.5 6.06646-13.5 13.5 0 7.519 6.0665 13.5 13.5 13.5 7.4336 0 13.5-6.0665 13.5-13.5.0855-7.43354-6.0664-13.5-13.5-13.5zm0 18.5411c-2.7342 0-5.0411-2.3069-5.0411-5.0411s2.3069-5.04114 5.0411-5.04114S29.4777 10.7658 29.4777 13.5c0 2.7342-2.2216 5.0411-5.0412 5.0411z" fill="url(#paint0_linear)" />
        <path class="brand" :stroke="stroke" d="M10.9367 3.93042V23.5823H6.1519L0 3.93042h10.9367z" fill="url(#paint1_linear)" />
    </svg>
</template>

<script>
    export default {
        props: {
            viewBox: {
                default: '0 0 38 27',
                type: String
            },
            height: {
                default: '100%',
                type: [Number, String]
            },
            width: {
                default: '100%',
                type: [Number, String]
            },
            stroke: {
                default: 'none',
                type: String
            }
        }
    }
</script>

<style scoped>
    svg {
        width: 100%;
    }
</style>
