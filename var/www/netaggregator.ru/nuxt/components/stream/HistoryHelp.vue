<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Закладки.</h2>

            <!--<p class="pane__topic-definition">
                Закладки модуля стрим...
            </p>-->

            <p class="pane__topic-disclosure">
                Закладки, по сути своей, организуют локальное хранилище ивентов, на устройстве пользователя. Добавление
                которых туда, осуществляется путем клика по соответствующим кнопкам в интерфейсе окна "стрим".
                Главное окно имеет схожий с окном "стрим" интерфейс. В нем отражается список сохраненных ивентов,
                каждый пункт которого имеет кнопку удаления <v-icon dense>mdi-playlist-minus</v-icon> из закладок и
                кнопку <v-icon dense>mdi-eye-outline</v-icon> детального просмотра содержимого. Детальный просмотор,
                это тоже самое окно детального просмотра в "стриме", с небольшим отличием в интерфейсе - вместо кнопки
                добавить, кнопка удалить <v-icon dense>mdi-trash-can-outline</v-icon>.
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
                '/img/help/stream-bookmarks-01.png',
                '/img/help/stream-bookmarks-02.png'
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
                    max-width: 70% !important;
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
