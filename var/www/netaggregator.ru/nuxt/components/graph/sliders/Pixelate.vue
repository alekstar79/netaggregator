<template>
    <div v-bind="$attrs">
        <v-slider
            v-model="blocksize"
            :thumb-label="true"
            :track-color="color"
            :color="color"
            :min="0"
            :max="20"
            always-dirty
            hide-details
        >
            <template slot="prepend">
                <v-icon @click="blocksize -= 1" v-text="'mdi-minus'" />
            </template>
            <template slot="append">
                <v-icon @click="blocksize += 1" v-text="'mdi-plus'" />
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
            blocksize(value) {
                this.$emit('update', { field: 'blocksize', value })
            }
        },
        data: () => ({
            blocksize: 0
        })
    }
</script>
