<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Стрим монитор.</h2>

            <!--<p class="pane__topic-definition">
                Стрим монитор...
            </p>-->

            <v-layout class="pane__images justify-flex right pc2">
                <v-img class="image-01" @click="view(0)" :src="images[0]" />
                <v-img class="image-02" @click="view(1)" :src="images[1]" />
            </v-layout>

            <p class="pane__topic-disclosure">
                Данный модуль, под капотом использует Vk Streaming API. Он позволяет подписаться на определенные
                ивенты (посты, комментарии) и получать их в режиме реального времени. Главный экран модуля, представляет
                из себя очередь пришедших событий, соответствующих тематике, выбранных пользователем тегов. Каждый
                ивент в очереди, можно рассмотреть детально, кликнув по соответствующей кнопке <v-icon dense>mdi-eye-outline</v-icon>,
                либо добавить в закладки <v-icon dense>mdi-playlist-plus</v-icon>. Окно детального просмотра отображает
                соответственно всю информацию ивента - содержание поста или комментария, прикрепленные вложения, теги,
                ссылки. Также в интерфейсе окна предусмотрены кнопки добавления в закладки <v-icon dense>mdi-bookmark</v-icon>
                и переход к записи <v-icon dense>mdi-redo-variant</v-icon>. В самом содержимом, клик по аватарке, осуществляет
                переход к владельцу (инициатору) события.
            </p>

            <v-img class="pane__images image-03 left" @click="view(2)" :src="images[2]" />

            <p class="pane__topic-disclosure">
                Окно настройки событий, позволяет ввести произвольные теги (поле фильтр), до 10 штук, которые соответствуют
                интересующей тематике. Ниже распологается поле ввода "стоп лист", содержимое которого будет указывать
                программе на ивенты, которые необходимо исключить из общего потока, в содержании которых присутствует
                указанный контент. Отдельным чекбоксом вынесена обсценная (ненормативная) лексика. Так же в интерфейсе
                предусмотрено поле ввода URL адреса, на который требуется ретранслировать, приходящие события. Прием и
                обработка на принимающей стороне, возлагается на пользователя. Статистика по ивентам представлена в
                отдельном модуле и будет рассмотрена в соответствующем разделе справки.
            </p>

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
                '/img/help/stream-list-01.png',
                '/img/help/stream-list-02.png',
                '/img/help/stream-list-03.png'
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
                .layout.pane__images.justify-flex.right {
                    max-width: 450px !important;
                    margin-left: 20px !important;
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
    @media all and (max-width: 761px) {
        .pane.scroller .container {
            //
        }
    }
    @media all and (max-width: 661px) {
        .pane.scroller .container {
            //
        }
    }
</style>
