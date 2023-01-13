<template>
    <div v-bind="$attrs">
        <v-slider
            v-model="noise"
            :thumb-label="true"
            :track-color="color"
            :color="color"
            :max="200"
            :min="0"
            always-dirty
            hide-details
        >
            <template slot="prepend">
                <v-icon @click="noise -= 10" v-text="'mdi-minus'" />
            </template>
            <template slot="append">
                <v-icon @click="noise += 10" v-text="'mdi-plus'" />
            </template>
        </v-slider>
    </div>
</template>

<script>
    export default {
        computed: {
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            noise(value) {
                this.$emit('update', { field: 'noise', value })
            }
        },
        data: () => ({
            noise: 0
        })
    }
</script>
