<template>
    <div v-if="visible" class="side-menu__block" :class="{ active }">
        <div @click="toggle" class="side-menu__block-overlay custom-cursor__overlay" />

        <div class="side-menu__block-inner">
            <div class="side-menu__top">
                <v-btn class="side-menu__toggler side-menu__close-btn"
                    @click.stop="toggle"
                    elevation="0"
                    aria-label="close-menu"
                    icon
                    fab
                >
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
            </div>

            <nav class="mobile-nav__container">
                <lazy-zimed-scroll-menu />
            </nav>

            <div class="side-menu__sep" />

            <div class="side-menu__content">
                <p>{{ $t('zimed.tools') }}</p>

                <p>
                    <a href="mailto:support@netaggregator.ru">
                        support@netaggregator.ru
                    </a>
                </p>

                <div class="side-menu__social">
                    <!--<a v-for="(s, i) in socials" @click.stop="" :class="`fab ${s}`" :key="i" />-->
                    <lazy-core-share />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        /* components: {
            ZimedScrollMenu: () => import('./ScrollMenu')
        }, */
        computed: {
            visible() {
                const { window: size = 1200 } = this.$store.state.app

                return size.width < 1199
            }
        },
        data: () => ({
            active: false

            /* socials: [
                'fa-facebook-f',
                'fa-twitter',
                'fa-instagram',
                'fa-pinterest-p'
            ] */
        }),
        methods: {
            toggle()
            {
                this.active = !this.active
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('sidemenu:toggle', this.toggle)
        },
        mounted()
        {
            this.$bus.$on('sidemenu:toggle', this.toggle)
        }
    }
</script>
