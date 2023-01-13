<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Список шаблонов.</h2>

            <v-layout class="pane__images right">
                <v-img class="image-01" @click="view(0)" :src="images[0]" />
            </v-layout>

            <p class="pane__topic-disclosure">
                Список шаблонов - это ни что иное как набор готовых обложек для вашей группы! Их можно использовать как есть,
                можно настраивать под себя (что более логично), как примеры или заготовки. А так же создание обложки с
                абсолютного нуля, ни кто не отменял. Как и весь интерфейс приложения, мы постарались сделать данный модуль
                как можно проще. В данном модуле вы можете обозревать визуальное представление обложек, то как они
                будут смотреться в шапке вашей группы. Все изображения кликабельны (собственно говоря как и во всем приложении),
                и при клике открываются во встроенном просмотрщике, который позволяет их увеличить, уменьшить, покрутить, отразить
                включить слайд шоу наконец и отправить понравившийся шаблон в редактор, для работы с ним. Так же в интерфейсе,
                у каждого шаблона имеется кнопка с выпадающим меню выбора действия - выбрать или редактировать.
                Выбор, помещает обложку в список ваших обложек, где вы ее и можете сразу увидеть в соответствующем модуле и
                проводить над ней манипуляции, предусмотренные приложением. Редактировать - позволяет сразу отправить обложку
                в редактор, без предварительной установки в список ваших сохраненных обложек. Поработать над ней там (в редакторе)
                и уже оттуда установить в список сохраненных. Кнопка добавить <v-icon dense>mdi-plus-circle-outline</v-icon>
                в хедере модуля, по задумке должа реализовывать функционал добавления шаблонов непосредственно пользователями,
                но на данном этапе, находится в стадии обсуждения и принятия решения о целесообразности ее в приложении.
            </p>

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
                '/img/help/covers-templates-01.png'
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
                    list-style-type: none;
                    padding: 5px;

                    .v-icon {
                        margin-right: 5px;
                    }
                }
            }
            .pane__topic-closing {
                margin: 16px auto;
                text-align: center;
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
