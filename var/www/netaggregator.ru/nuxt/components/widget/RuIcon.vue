<template>
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="height" :width="width">
        <rect fill="transparent" height="48" width="48" />

        <text :fill="fill"
            :stroke="fill"
            :transform="transform"
            font-family="Helvetica,Arial,sans-serif"
            font-weight="700"
            font-size="48"
            stroke-width="0"
            x="-95"
            y="42"
        >
            {{ text }}
        </text>

        <template v-if="off">
            <line y2="2" x2="45" y1="45" x1="2" stroke-width="4" :stroke="fill" fill="none" />
        </template>
    </svg>
</template>

<script>
    export default {
        props: {
            viewBox: {
                default: '0 0 48 48',
                type: String
            },
            transform: {
                default: 'matrix(.5, 0, 0, 1, 55, 0)',
                type: String
            },
            height: {
                default: 18,
                type: [Number, String]
            },
            width: {
                default: 18,
                type: [Number, String]
            },
            fill: {
                default: '#fff',
                type: String
            },
            text: {
                default: 'RU',
                type: String
            },
            off: {
                default: false,
                type: Boolean
            }
        }
    }
</script>
