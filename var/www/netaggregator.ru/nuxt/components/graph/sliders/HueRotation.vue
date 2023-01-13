<template>
    <div v-bind="$attrs">
        <v-slider
            v-model="rotation"
            :thumb-label="true"
            :track-color="color"
            :color="color"
            :step=".002"
            :min="-2"
            :max="2"
            always-dirty
            hide-details
        >
            <template slot="prepend">
                <v-icon @click="rotation -= .2" v-text="'mdi-minus'" />
            </template>
            <template slot="append">
                <v-icon @click="rotation += .2" v-text="'mdi-plus'" />
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
            rotation(value) {
                this.$emit('update', { field: 'rotation', value })
            }
        },
        data: () => ({
            rotation: 0
        })
    }
</script>
