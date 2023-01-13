<template>
    <content-loader :height="height" :width="width" :speed="2" unique-key="x07ce-160279" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
        <rect v-for="(s, i) in set" :x="s.x" :y="s.y" :rx="s.rx" :ry="s.ry" :width="s.width" :height="s.height" :key="i" />
    </content-loader>
</template>

<script>
    export default {
        components: {
            ContentLoader: () => import(/* webpackChunkName: "content-loader" */ 'vue-content-loader')
                .then(m => m.ContentLoader)
        },
        props: {
            height: {
                type: [Number, String],
                default: 200
            },
            width: {
                type: [Number, String],
                default: 350
            },
            speed: {
                type: [Number, String],
                default: 2
            },
            set: {
                type: Array,
                default: () => [
                    { x: 1,   y: 1,   rx: 3, ry: 3, width: 67,  height: 11 },
                    { x: 77,  y: 0,   rx: 3, ry: 3, width: 140, height: 11 },
                    { x: 128, y: 48,  rx: 3, ry: 3, width: 53,  height: 11 },
                    { x: 188, y: 48,  rx: 3, ry: 3, width: 72,  height: 11 },
                    { x: 19,  y: 48,  rx: 3, ry: 3, width: 100, height: 11 },
                    { x: 1,   y: 71,  rx: 3, ry: 3, width: 37,  height: 11 },
                    { x: 19,  y: 23,  rx: 3, ry: 3, width: 140, height: 11 },
                    { x: 167, y: 23,  rx: 3, ry: 3, width: 173, height: 11 }
                 // { x: 1,   y: 92,  rx: 3, ry: 3, width: 67,  height: 11 },
                 // { x: 77,  y: 91,  rx: 3, ry: 3, width: 140, height: 11 },
                 // { x: 128, y: 139, rx: 3, ry: 3, width: 53,  height: 11 },
                 // { x: 188, y: 139, rx: 3, ry: 3, width: 72,  height: 11 },
                 // { x: 19,  y: 139, rx: 3, ry: 3, width: 100, height: 11 },
                 // { x: 1,   y: 162, rx: 3, ry: 3, width: 37,  height: 11 },
                 // { x: 19,  y: 114, rx: 3, ry: 3, width: 140, height: 11 },
                 // { x: 167, y: 114, rx: 3, ry: 3, width: 173, height: 11 }
                ]
            }
        }
    }
</script>
