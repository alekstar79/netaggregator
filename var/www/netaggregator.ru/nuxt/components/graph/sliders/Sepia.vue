<template>
    <div v-bind="$attrs">
        <v-slider
            v-model="amount"
            :thumb-label="true"
            :track-color="color"
            :color="color"
            always-dirty
            hide-details
            :step=".005"
            :min="0"
            :max="1"
        >
            <template slot="prepend">
                <v-icon @click="amount -= .1" v-text="'mdi-minus'" />
            </template>
            <template slot="append">
                <v-icon @click="amount += .1" v-text="'mdi-plus'" />
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
            amount(value) {
                this.$emit('update', { field: 'amount', value })
            }
        },
        data: () => ({
            amount: 0
        })
    }
</script>
