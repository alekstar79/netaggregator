<template>
    <section v-scroll="onScroll" class="service-one" id="features">
        <div class="container">
            <div class="block-title text-center">
                <span class="block-title__bubbles" />
                <p>{{ $t('zimed.app_components') }}</p>
                <h3>{{ $t('zimed.need_app') }}</h3>
            </div>

            <nav v-schema:scope="{ type: 'SiteNavigationElement' }" class="row">
                <template v-for="(srv, i) in services">
                    <n-link v-schema="{ prop: 'url' }"
                        class="service-one__col wow fadeInUp"
                        :data-wow-duration="duration"
                        :data-wow-delay="srv.delay"
                        :to="srv"
                        :key="i"
                        v-wow
                    >
                        <div class="service-one__single">
                            <i :class="srv.icon" />

                            <h3 v-schema="{ prop: 'name' }"
                                v-html="$t(`toolbar.${srv.path.slice(1)}`)"
                            />
                        </div>
                    </n-link>
                </template>
            </nav>
        </div>
    </section>
</template>

<script>
    import { getCoords } from '~/utils/common/coords.mjs'
    import { wow } from '~/directives/wow'

    export default {
        directives: {
            wow
        },
        props: {
            services: {
                type: Array,
                default: () => [{
                    icon: 'mdi mdi-message-text',
                    name: 'Chatbot',
                    path: '/chatbot',
                    delay: '0ms'
                },{
                    icon: 'mdi mdi-view-stream',
                    name: 'Stream',
                    path: '/stream',
                    delay: '100ms'
                },{
                    icon: 'mdi mdi-widgets',
                    name: 'Widget',
                    path: '/widget',
                    delay: '200ms'
                },{
                    icon: 'mdi mdi-view-carousel',
                    name: 'Cover',
                    path: '/cover',
                    delay: '300ms'
                },{
                    icon: 'mdi mdi-palette-outline',
                    name: 'Designer',
                    path: '/designer',
                    delay: '400ms'
                }]
            },
            duration: {
                type: String,
                default: '1500ms'
            }
        },
        data: () => ({
            min: 0,
            max: 0
        }),
        watch: {
            '$store.state.app.window': 'positioning'
        },
        methods: {
            positioning()
            {
                const { top, height } = getCoords(this.$el)

                this.max = top + height
                this.min = top
            },
            emitVisibility(data)
            {
                this.$bus.$emit('scroll:goal', { id: 'features', ...data })
            },
            onScroll(event)
            {
                const offsetTop = event.target.scrollingElement.scrollTop

                if (offsetTop > this.min && offsetTop < this.max) {
                    this.emitVisibility({ min: this.min, max: this.max })
                }
            }
        },
        mounted()
        {
            this.$nextTick().then(this.positioning)
        }
    }
</script>

<style scoped>
    .service-one {
        background-color: #fff;
    }
</style>
