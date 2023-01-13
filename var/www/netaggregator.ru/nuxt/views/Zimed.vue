<template>
    <v-layout column>
        <zimed-header />
        <zimed-banner />
        <zimed-service />
        <zimed-features-one />
        <zimed-features-two />
        <zimed-screenshots />
        <zimed-pricing />
        <zimed-testimonial :slides="slides" />
        <zimed-faq />
        <zimed-call-to-action />
        <client-only>
            <zimed-side-menu />
        </client-only>
        <zimed-footer />
    </v-layout>
</template>

<script>
    import 'bootstrap/dist/css/bootstrap-grid.css'

    import '~/assets/css/animate.css'
    import '~/assets/css/zimed.css'
    import '~/assets/css/responsive.css'

    // const description = 'Агрегированный инструментарий для сообществ Вконтакте, позволяющий придать выразительности и уникальности группе, а так же взаимодействовать с аудиторией. В набор включены такие сервисы как - динамическая обложка, виджеты, чат-бот, стримридер и графический редактор.'
    const description = 'Инструментарий для сообществ Вконтакте, позволяющий придать выразительности и уникальности группе, взаимодействовать с аудиторией. Управлять сообществом с широким функционалом можно с помощью Netaggregator.',
        title = 'Система управления групп ВКонтакте, рабочая среда администраторов сообществ Вконтакте'

    // import Skeleton from '~/components/core/Skeleton'
    // import { builder } from '~/utils/lazy'

    export default {
        layout: 'zimed',

        /* components: builder({
            ZimedHeader: () => import('../zimed/Header'),
            ZimedBanner: () => import('../zimed/Banner'),
            ZimedService: () => import('../zimed/Service'),
            ZimedFeaturesOne: () => import('../zimed/FeaturesOne'),
            ZimedFeaturesTwo: () => import('../zimed/FeaturesTwo'),
            ZimedScreenshots: () => import('../zimed/Screenshots'),
            ZimedCounter: () => import('../zimed/Counter'),
            ZimedPricing: () => import('../zimed/Pricing'),
            ZimedTestimonial: () => import('../zimed/Testimonial'),
            ZimedBrands: () => import('../zimed/Brands'),
            ZimedFaq: () => import('../zimed/Faq'),
            ZimedCallToAction: () => import('../zimed/CallToAction'),
            ZimedSideMenu: () => import('../zimed/SideMenu'),
            ZimedFooter: () => import('../zimed/Footer')
        },{
            loading: Skeleton,
            loadingData: {
                props: {
                    width: '100%',
                    height: '40em'
                }
            }
        }), */
        head() {
            return {
                title: this.$t('common.home'),
                meta: [
                    { name: 'description',         hid: 'description',         content: description },
                    { name: 'og:description',      hid: 'og:description',      content: description },
                    { name: 'og:url',              hid: 'og:url',              content: 'https://netaggregator.ru' },
                    { name: 'twitter:card',        hid: 'twitter:card',        content: 'summary_large_image' },
                    { name: 'twitter:title',       hid: 'twitter:title',       content: title },
                    { name: 'twitter:description', hid: 'twitter:description', content: description },
                    { name: 'twitter:image',       hid: 'twitter:image',       content: 'https://netaggregator.ru/icon.png' }
                ]
            }
        },
        jsonld()
        {
            return {
                '@context': 'https://schema.org/',
                '@type': 'WebSite',
                name: 'Netaggregator',
                url: 'https://netaggregator.ru',
                image: 'https://netaggregator.ru/icon.png',
                sameAs: ['http://vk.com/netaggregator'],
                description
            }
        },
        data: () => ({
            slides: [
                { title: 'accessible_title',   text: 'accessible_text',   src: '/img/starter/thumb-up.svg'    },
                { title: 'quickly_title',      text: 'quickly_text',      src: '/img/starter/clock-fast.svg'  },
                { title: 'reliable_title',     text: 'reliable_text',     src: '/img/starter/shield-lock.svg' },
                { title: 'comfortable_title',  text: 'comfortable_text',  src: '/img/starter/heart.svg'       },
                { title: 'functionally_title', text: 'functionally_text', src: '/img/starter/hubspot.svg'     }
            ]
        }),
        async beforeMount()
        {
            if (!this.$store.state.app.vkapp) return

            const route = await this.$ls.get('route') || {},
                doit = await this.$ls.get('doit') || {}

            if (doit.route || route.path) {
                await this.$router.replace(doit.route || route.path)
                this.replace = true
            }
        }
    }
</script>
