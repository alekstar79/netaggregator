<template>
    <div v-bind="$attrs">
        <v-slider
            v-model="saturation"
            :thumb-label="true"
            :track-color="color"
            :color="color"
            :step=".005"
            :min="-1"
            :max="1"
            always-dirty
            hide-details
        >
            <template slot="prepend">
                <v-icon @click="saturation -= .1" v-text="'mdi-minus'" />
            </template>
            <template slot="append">
                <v-icon @click="saturation += .1" v-text="'mdi-plus'" />
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
            saturation(value) {
                this.$emit('update', { field: 'saturation', value })
            }
        },
        data: () => ({
            saturation: 0
        })
    }
</script>
