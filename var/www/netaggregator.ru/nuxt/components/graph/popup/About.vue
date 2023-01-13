<template>
    <graph-drag hash="about"
        class="drag-about"
        @close="$emit('tool:cancel')"
        :title="$t('graph.about')"
        :close="true"
        :snap="snap"
        ref="drag"
    >
        <div class="about-pane">
            <table style="width:99%;">
                <tbody>
                    <tr class="about-row">
                        <th style="text-align: right">Name:</th>
                        <td style="padding:5px 10px;" colspan="2">
                            <span class="data-name">
                                NA Designer
                            </span>
                        </td>
                    </tr>
                    <tr class="about-row">
                        <th style="text-align: right">Description:</th>
                        <td style="padding:5px 10px;" colspan="2">
                            <span id="data-description">
                                Online image editor
                            </span>
                        </td>
                    </tr>
                    <tr class="about-row">
                        <th style="text-align: right">Version:</th>
                        <td style="padding:5px 10px;" colspan="2">
                            <span id="data-version">
                                1.1.0
                            </span>
                        </td>
                    </tr>
                    <tr class="about-row">
                        <th style="text-align: right">Author:</th>
                        <td style="padding:5px 10px;" colspan="2">
                            <span id="data-author">
                                alekstar79
                            </span>
                        </td>
                    </tr>
                    <!--<tr class="about-row">
                        <th style="text-align: right">Glitch:</th>
                        <td style="padding:5px 10px;" colspan="2">
                            <v-checkbox
                                :label="`${checkbox ? 'on' : 'off'}`"
                                v-model="checkbox"
                                :color="color"
                                :ripple="false"
                                hide-details
                                disabled
                            />
                        </td>
                    </tr>-->
                </tbody>
            </table>
        </div>
    </graph-drag>
</template>

<script>
    export default {
        props: {
            snap: {
                type: Number,
                default: 5
            }
        },
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'white' : this.$store.state.app.color
            }
        },
        data() {
            return {
                checkbox: this.$parent ? this.$parent.glitch : false
            }
        }
        /* watch: {
            checkbox(v) {
                this.$ls.set('image-editor-glitch', v)
                this.$parent.glitch = v
            }
        } */
    }
</script>

<style lang="scss" scoped>
    .drag-about {
        max-width: 280px;

        .about-pane {
            display: flex;
            flex-direction: column;
            user-select: none;
            font-size: 16px;

            .v-input.v-input--selection-controls {
                padding: 0;
                margin: 0;

                .v-input__slot {
                    padding-left: 5px;
                    margin: 0;
                }
            }
        }
    }
</style>
