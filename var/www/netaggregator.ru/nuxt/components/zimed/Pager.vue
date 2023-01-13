<template>
    <div v-bind="$attrs">
        <span v-for="({ style, src } , i) in slides" class="pager-item" :class="{ active: i === active }" :style="style" :key="i">
            <img :src="src" :alt="src.split(/\/|\.svg|-/).filter(Boolean).slice(2).join(' ').trim()">
        </span>
    </div>
</template>

<script>
    export default {
        props: {
            slides: {
                type: Array,
                required: true
            },
            active: {
                type: Number,
                required: true
            }
        }
    }
</script>
