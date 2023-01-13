<template>
    <v-app-bar class="footer-toolbar v-toolbar--fixed" height="60px" elevation="0" absolute bottom tile app>
        <v-toolbar-items class="footer__links">
            <v-layout align-center>
                <template v-for="lnk in links">
                    <span @click="handler(lnk)" :key="lnk.name" class="footer__links--item">
                        {{ $t(`footer.${lnk.name}`) }}
                    </span>
                </template>
            </v-layout>
        </v-toolbar-items>

        <v-spacer />

        <v-toolbar-title class="footer-title">
            <a :href="titleLnk" target="_parent">
                &copy; Netaggregator
            </a>
        </v-toolbar-title>
    </v-app-bar>
</template>

<script>
    export default {
        computed: {
            /* copyright() {
                return `© ${new Date().getFullYear()} Netaggregator`
            }, */
            titleLnk() {
                const { user, vkapp } = this.$store.state.app,
                    uid = user?.id ? `_${user?.id}` : ''

                return vkapp
                    ? `https://netaggregator.ru${this.$route.path}`
                    : `https://vk.com/services?w=app7185564${uid}`
            },
            links() {
                return [
                    { name: 'home', path: '/' }
                    // ...
                ]
            }
        },
        methods: {
            async handler({ name, path })
            {
                if (this.$store.state.app.vkapp && path === '/') {
                    this.$ls.set('route', { path: null })
                }

                try {

                    await this.$router.push({ name, path })

                } catch (e) {
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    // $link: #495057;

    .v-toolbar.footer-toolbar {
        min-height: unset;
        margin: 0;

        box-shadow: none !important;
        font-weight: 400;

        .v-toolbar__content {
            min-height: unset;
            background: $basic-bg-color !important;

            .footer-title {
                font-size: 18px;
                letter-spacing: unset;
                user-select: none;

                a:hover {
                    color: #4680FE !important;
                }
                a, a:visited {
                    text-decoration: none;
                    color: #8f8f8f;
                }
            }
            .footer__links .footer__links--item {
                text-transform: uppercase;
                text-decoration: none;
                font-size: 14px;

                margin: 0 5px;

                cursor: pointer;
                user-select: none;
                color: #9a9a9a;

                &:hover {
                    color: #4680FE !important;
                }
                &:visited {
                    color: #8f8f8f;
                }
            }
        }
        &.theme--dark {
            .v-toolbar__content {
                background: $basic-bg-color !important;

                .footer__links .footer__links--item:hover,
                .footer-title a:hover {
                    color: #9a9a9a !important;
                }
            }
        }
    }
    @media all and (max-width: 320px) {
        .v-toolbar.footer-toolbar .v-toolbar__content {
            .footer-title {
                display: none;
            }
        }
    }
</style>
