<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Виджет "Матч".</h2>

            <!--<p class="pane__topic-definition">
                Виджет "Матч"...
            </p>-->

            <v-img class="pane__images image-01 right" @click="view(0)" :src="images[0]" />

            <p class="pane__topic-disclosure">
                Виджет "Матч", встраивает блок результата спортивного матча в группу пользователя.
                В интерфейсе модуля предусмотрены поле ввода заголовока, ссылка в футере, блоки логотипов
                команд (как и любой блок изображения, позволяет выбрать из существующих или загрузить новое),
                блоки названий и краткого описания команд, блок текущего состояния и результата
                спортивного матча. Функционал настройки и кастомизации блока рассмотрен в общем
                для всех виджетов разделе справочного руководства.
            </p>

            <div class="clearfix" />

            <v-layout class="pane__images justify-flex pc3" column>
                <v-img class="image-02" @click="view(1)" :src="images[1]" />
                <v-img class="image-03" @click="view(2)" :src="images[2]" />
                <v-img class="image-04" @click="view(3)" :src="images[3]" />
            </v-layout>

            <!--<div class="clearfix" />-->

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
                '/img/help/widget-match-01.png',
                '/img/help/widget-match-02.png',
                '/img/help/widget-match-03.png',
                '/img/help/widget-match-04.png'
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
                .pane__images.pc3 .v-image {
                    max-width: 25%;
                }
                .clearfix::after {
                    height: 50px;
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
