<template>
    <svg v-on="$listeners" v-bind="$attrs" xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :height="size" :width="size">
        <g :stroke="stroke" :fill="fill" :color="fill" fill-rule="evenodd">
            <path d="M18.3 5.7a.99.99 0 0 0-1.4 0L12 10.6 7.1 5.7a.99.99 0 0 0-1.4 1.4l4.9 4.9-4.9 4.9a.99.99 0 0 0 1.4 1.4l4.9-4.9 4.9 4.9a.99.99 0 0 0 1.4-1.4L13.4 12l4.9-4.9a.99.99 0 0 0 0-1.4z" fill="currentColor" />
        </g>
    </svg>
</template>

<script>
    export default {
        props: {
            viewBox: {
                default: '0 0 24 24',
                type: String
            },
            size: {
                default: 24,
                type: [Number, String]
            },
            fill: {
                default: 'none',
                type: String
            },
            stroke: {
                default: 'none',
                type: String
            }
        }
    }
</script>
