<template>
    <v-flex class="line-type" v-bind="$attrs">
        <v-select
            @change="onChange"
            :label="$t('graph.line_type')"
            :value="current"
            :items="options"
            :item-color="color"
            :color="color"
            hide-details
            outlined
            dense
        />
    </v-flex>
</template>

<script>
    export default {
        data: () => ({
            options: [
                { value: 'solid',  text: 'Solid'  },
                { value: 'dotted', text: 'Dotted' },
                { value: 'dashed', text: 'Dashed' }
            ]
        }),
        computed: {
            current() {
                return this.$store.state.canvas.drawerOptions.lineType
            },
            color() {
                return this.$store.state.app.color
            }
        },
        methods: {
            onChange(type)
            {
                this.$store.commit('canvas/setLineType', type)
            }
        }
    }
</script>
