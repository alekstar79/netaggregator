<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Менеджер рассылок.</h2>

            <!--<p class="pane__topic-definition">
                Менеджер рассылок...
            </p>-->

            <v-layout class="pane__images right" column>
                <v-img class="image-01" @click="view(0)" :src="images[0]" />
            </v-layout>

            <p class="pane__topic-disclosure mt-1">
                Менеджер позволяет осуществлять таргетированную рассылку сообщений подписчикам группы и предоставляет
                простой интерфейс управления и планирования.<br><br>
                Создание и запуск рассылки еще ни когда не был таким простым! Реализуется в пару кликов, некоторого времени
                на ожидание сбора базы подписчиков и непосредственного ввода сообщения в котором вы хотите донести до подписчика
                вашу информацию. А так как в вашем распоряжении, параллельно имеется чатбот, то развернуть автоматизированную
                систему работы с лидами (знакомство с продуктом/услугой, сегментирование, лид-магнит, прогрев и т.д.) проще простого.
                Еще более простым языком - рассылка и чатбот могут задействоваться как врозь, так и в спарке. Рассылка,
                в таком случае будет являться инициатором запуска автоворонки, а всю остальную логику, возьмет на себя чатбот.
                Как и в любом другом сервисе рассылки, настройку и запуск, можно разделить на несколько этапов, но в данном
                приложении - это условности. Начинать возможно с любого, сбор базы или создание контентной части, настройка
                фильтра (сегментация), единственное условие - перед непосредственным запуском, база подписчиков должна
                быть собрана. Вкратце рассмотрим этапы запуска:
            </p>

            <ul class="features-list with-marks">
                <li>
                    сбор базы, реализуется одним действием - нажатием кнопки СОЗДАТЬ или кнопки обновить
                    <v-icon dense>mdi-sync</v-icon> в соответствующем поле ввода
                </li>
                <li>
                    создание сообщения, тут все просто - есть текстовое поле,
                    с набором инструментов, аналогичных чатботу
                </li>
                <li>
                    настройка фильтров сводится к выбору соответствующих категорий в фильтре,
                    специфика заключается в том, что выбор фильтра(ов) не приводит к изменению состояния
                    приложения на сервере и имеет значение только здесь и сейчас. Простая перезагрузка
                    страницы приведет к сбросу последних. Для того чтобы зафиксировать установку
                    фильтра, необходимо отправить запрос на пересчет реципиентов с учетом введенных
                    фильтров, кликнув по кнопке <v-icon dense>mdi-sync</v-icon> (sync)
                </li>
            </ul>

            <p class="pane__topic-disclosure">
                Поддерживается возможность отложенного запуска (планирование), а так же сохранение рассылки с возможностью
                последующего редактирования и повторного использования - кнопки сохранить <v-icon dense>mdi-content-save</v-icon>
                и открыть <v-icon dense>mdi-folder-open-outline</v-icon> в хедере модуля.
            </p>

            <v-layout class="pane__images justify-flex pc3" mb-3 column>
                <v-img class="image-02" @click="view(1)" :src="images[1]" />
                <v-img class="image-03" @click="view(2)" :src="images[2]" />
                <v-img class="image-04" @click="view(3)" :src="images[3]" />
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
                '/img/help/chatbot-mailings-01.png',
                '/img/help/chatbot-mailings-02.png',
                '/img/help/chatbot-mailings-03.png',
                '/img/help/chatbot-mailings-04.png'
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
            .features-list {
                display: flow-root;
                padding-bottom: 16px;

                & > li {
                    padding: 5px;

                    .v-icon {
                        margin-right: 5px;
                    }
                }
                &:not(.with-marks) {
                    & > li {
                        list-style-type: none;
                    }
                }
            }
            .pane__topic-closing {
                margin: 16px auto;
                text-align: center;
            }
            &.fullscreen:not(.mobile) {
                .pane__images.pc3 .v-image {
                    max-width: unset !important;

                    &:nth-child(2) {
                        flex: 2 0 42%;
                    }
                    &:first-child,
                    &:last-child {
                        flex: 0 1 auto;
                    }
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
