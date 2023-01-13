<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Графики.</h2>

            <p class="pane__topic-definition">
                Окно графиков модуля стрим - это визуальное представление статистики по тегам. Имеет два режима -
                график абсолютных показателей (barchart), за весь период сбора статистики, начиная с момента
                установки фильтра, и график посуточной динамики изменений (linechart) данной выборки тегов.
                Последний режим, позволяет варьировать временным диапазоном (бегунок под графиком), для более
                удобного отображения статистики. Чекбоксы в футере окна, позволяют включать или исключать (комбинировать)
                набор требуемых для отображения тегов, что также, на ряду с time range слайдером, позволяет гибко
                кастомизировать график. В хедере окна, предусмотрены две кнопки - переключеник графиков
                <v-icon dense>mdi-chart-bar</v-icon> и сброс статистики <v-icon dense>mdi-sync</v-icon>
            </p>

            <v-layout class="pane__images justify-flex pc2">
                <v-img class="image-01" @click="view(0)" :src="images[0]" />
                <v-img class="image-02" @click="view(1)" :src="images[1]" />
            </v-layout>

            <div class="clearfix" />

            <p class="pane__topic-closing">
                Справочное руководство может быть обновлено, уточнено и дополнено.
            </p>
        </v-container>
    </v-layout>
</template>

<script>
    import { help } from '~/mixins/common'

    export default {
        mixins: [help],

        props: {
            fullscreen: {
                type: Boolean,
                required: true
            }
        },
        computed: {
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        watch: {
            fullscreen() {
                this.smooth.scrollTo(null, 0)
            }
        },
        data: () => ({
            images: [
                '/img/help/stream-charts-01.png',
                '/img/help/stream-charts-02.png'
            ]
        }),
        methods: {
            view(idx)
            {
                this.$bus.$emit('view', { idx, frame: this.images.map(url => ({ url, src: url })), edit: false })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .pane.scroller {
        .container.pane__topic {
            .pane__topic-closing {
                margin: 16px auto;
                text-align: center;
            }
            &.fullscreen:not(.mobile) {
                .layout.pane__images.justify-flex {
                    max-width: 80% !important;
                    margin: 0 auto;
                }
            }
            h2 {
                color: #006dad;
            }
        }
        &.theme--dark {
            .container h2 {
                color: hsla(0,0%,100%,.7);
            }
        }
    }
</style>
