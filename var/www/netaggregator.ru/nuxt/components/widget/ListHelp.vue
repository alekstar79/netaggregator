<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Виджет "Карточки".</h2>

            <p class="pane__topic-disclosure">
                Виджет "Карточки", встраивает блок карточек (до 3-х штук) в группу пользователя.
                В интерфейсе модуля предусмотрены следующие поля ввода - заголовок блока, заголовок карточки,
                адрес, время, описание. Так же, ссылка в футере блока и кнопка (опционально). Блок аватарки
                с всплывающим окном выбора и загрузки изображений, который позволяет выбрать изоражение из
                уже загруженных или загрузить новое. Функционал настройки и кастомизации блока
                рассмотрен в общем для всех виджетов разделе справочного руководства.
            </p>

            <v-layout class="pane__images justify-flex pc2">
                <v-img class="pane__images image-01 left" @click="view(0)" :src="images[0]" />
                <v-img class="pane__images image-02 right" @click="view(1)" :src="images[1]" />
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
                '/img/help/widget-cards-01.png',
                '/img/help/widget-cards-02.png'
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
                margin: 20px auto;
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
