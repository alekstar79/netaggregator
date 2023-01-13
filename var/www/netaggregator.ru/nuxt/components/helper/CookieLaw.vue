<template>
    <v-layout v-if="isOpen" class="cookie" :class="{ lift }" justify-center>
        <v-alert transition="scale-transition"
            :value="alert"
            :color="color"
            elevation="1"
            type="info"
            prominent
            dense
        >
            <v-row align="center">
                <v-col class="grow">
                    {{ $t('common.cookie_law_post') }}
                    {{ $t('common.find_more') }}
                    <a @click="$bus.$emit('show:law-docs')" class="cookie__link">
                        {{ $t('common.law_docs') }}
                    </a>.
                </v-col>

                <v-btn class="shadowless translucent v-btn--round" @click="accept">
                    {{ $t('common.accept') }}
                </v-btn>
            </v-row>
        </v-alert>
    </v-layout>
</template>

<script>
    export default {
        props: {
            lift: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        data: () => ({
            isOpen: false,
            alert: false
        }),
        methods: {
            accept()
            {
                this.$ls.set('GDPR:accepted', true)

                this.alert = false

                setTimeout(() => {
                    this.isOpen = false
                }, 500)
            }
        },
        async mounted()
        {
            try {

                if (this.$store.state.app.vkapp || this.mobile) return

                const accepted = await this.$ls.get('GDPR:accepted')

                if ((this.isOpen = !accepted)) {
                    setTimeout(() => this.alert = true)
                }

            } catch (e) {
            }
        }
    }
</script>

<style lang="sass" scoped>
    .cookie
        z-index: 1
        padding: 0 15%
        position: fixed
        bottom: 0
        &.lift
            z-index: 99
        &__link
            color: #ffffff
            text-decoration: underline
            transition: all .25s
            &:hover
                text-decoration: none
        .v-alert
            .row
                margin: unset
            .v-btn.v-btn--round.shadowless
                padding: 12px 30px
                margin: 10px
                height: auto
                width: unset

                border-radius: 30px
                line-height: 1.5em
                cursor: pointer

                background-color: transparent
</style>
