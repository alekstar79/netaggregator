<template>
    <v-btn class="intro-btn mb-5 mr-5" @click="playIntro" :color="color" height="64" width="64" bottom right fixed fab>
        <v-badge-patched @click.stop="removeIntroBtn" icon="mdi-close" offset-x="0" offset-y="0" color="#fff">
            <v-icon color="#fff">mdi-play-circle-outline</v-icon>
        </v-badge-patched>
    </v-btn>
</template>

<script>
    import { VBadgePatched } from '~/utils/v-badge-patch'

    export default {
        components: {
            VBadgePatched
        },
        computed: {
            color() {
                return this.$store.state.app.color
            }
        },
        methods: {
            async removeIntroBtn()
            {
                try {

                    await this.$ls.set('designer:intro', true)

                    this.$emit('viewed', true)

                } catch (e) {
                }
            },
            playIntro()
            {
                this.$emit('show:intro')

                this.removeIntroBtn()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .intro-btn {
        z-index: 9;

        .v-btn__content {
            .v-badge::v-deep .v-badge__wrapper {
                .v-badge__badge {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: rgba(0,0,0,.54);
                    cursor: pointer;
                    width: 10px;
                    z-index: 10;

                    .v-icon {
                        font-size: 18px;
                        margin: 0;
                    }
                }
            }
            .v-icon {
                font-size: 48px;
            }
        }
    }
</style>
