<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Список обложек.</h2>

            <p class="pane__topic-definition">
                Интерфейс минималистичен и интуитивно понятен. Начальный экран, отображает сам список, созданных
                вами обложек с набором стандартных инструментов:
            </p>

            <ul class="features-list list-tools">
                <li><v-icon dense>mdi-pencil</v-icon> редактировать </li>
                <li><v-icon dense>mdi-content-copy</v-icon> копировать </li>
                <li><v-icon dense>mdi-trash-can-outline</v-icon> удалить </li>
            </ul>

            <p class="pane__topic-disclosure">
                Режим редактирования - это просто монитор состояния или проекция обложки. Сам редактор как таковой,
                вынесен в отдельный програмный модуль и имеет собственную
                <span class="link" @click="toggleToDesignerHelp">справочную систему</span>.
                Здесь же, представлено визуальное отображение обложки и блок перечня установленных виджетов.
                Также в интерфейсе (верхняя панель окна) предусмотрена кнопка <v-icon dense>mdi-pencil</v-icon>
                переноса обложки в графический редактор, в котором и происходит непосредственно редактирование.
                Функционал и технические возможности редактора, рассмотрены в справочном руководстве редактора,
                здесь же мы хотели отметить ключевой момент. Мы концептуально пересмотрели взгляд на то, что
                из себя должен представлять редактор динамической обложки. Все ныне существующие аналоги,
                позволяют только загрузить готовый дизайн (фон) и далее подразумевается работа с виджетами.
                А любая фича по типу вставки текста или изображения уже является виджетом, функционал по работе
                с графикой либо очень скуден, либо напрочь отсутствует. Вот именно это мы и пересмотрели при
                проектировании сервиса. Была поставлена задача, разработать именно графический редактор, что
                при нынешнем состоянии веба, как выяснилось, не является уж такой невыполнимой задачей. Созданный
                редактор, не является полноценной заменой Photoshop, дабы не переусложнять сервис. Один из пунктов
                технтческого задания гласил - функционал и фичи редактора, должны быть легки и понятны рядовому
                пользователю, а не только эксперту фотошопа. Другой - сохранение баланса между разнообразием
                (количеством) фич и оптимальной необходимостью последних. В итоге, сервис предоставляет более
                обширный и удобный функционал по работе с дизайном обложки, а многие фичи, названные виджетами
                в аналогах, предоставляются базовым функционалом редактора и доступны абсолютно бесплатно.
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
                '/img/help/covers-list-01.png',
                '/img/help/covers-list-02.png'
            ]
        }),
        methods: {
            view(idx)
            {
                this.$bus.$emit('view', { idx, frame: this.images.map(url => ({ url, src: url })), edit: false })
            },
            toggleToDesignerHelp()
            {
                this.$bus.$emit('toggle:designer')
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
                &.list-tools {
                    display: flex;
                    justify-content: space-around;
                    padding-left: 0;
                }
            }
            .pane__topic-disclosure {
                span.link {
                    text-align: unset;
                    cursor: pointer;
                    color: #82B1FF;
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
    @media all and (max-width: 460px) {
        .pane.scroller .container {
            .list-tools {
                flex-direction: column;
                justify-content: unset;
                padding-left: 24px !important;
            }
        }
    }
</style>
