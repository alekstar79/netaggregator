<template>
    <div v-bind="$attrs">
        <v-slider
            v-model="blur"
            :thumb-label="true"
            :track-color="color"
            :color="color"
            :step=".01"
            :min="0"
            :max="1"
            always-dirty
            hide-details
        >
            <template slot="prepend">
                <v-icon @click="blur -= .2" v-text="'mdi-minus'" />
            </template>
            <template slot="append">
                <v-icon @click="blur += .2" v-text="'mdi-plus'" />
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
            blur(value) {
                this.$emit('update', { field: 'blur', value })
            }
        },
        data: () => ({
            blur: 0
        })
    }
</script>
