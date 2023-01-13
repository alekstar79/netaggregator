<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Правая панель инструментов.</h2>

            <!--<p class="pane__topic-definition">
                Раздел справки секция левый тулбар
            </p>-->

            <v-img class="pane__images image-01 right" @click="view(0)" :src="images[0]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-magic-wand</v-icon> Волшебная палочка - инструмент нечеткий выбор (Magic Wand)
                предназначен для выбора областей текущего слоя на основе сходства цветов. Интерфейс панели управления,
                содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер уровня порога заполнения</li>
                <li>палитра выбора цвета заливки</li>
                <li>переключатель режимов обработки</li>
            </ul>

            <p class="pane__topic-disclosure">
                Уровень или порог заполнения - определяет величину насколько далеко будет распространяться выделение,
                аналогично тому, как работает Fuzzy Select (Magic Wand) во всех известных графических редакторах.
                Выделение начинается в точке, где вы нажимаете, и распространяется наружу до тех пор, пока цвет
                или альфа-значение не станут “слишком разными”. Палитра заливки, определяет каким цветом будет
                залита выделенная область, применительно только к режиму заливки. Переключатель режимов, в свою
                очередь, как раз определяет, какое действие необходимо совершить, над выделенной областью -
                залить, вырезать, копировать.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-02 right" @click="view(1)" :src="images[1]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-desaturate</v-icon> Обесцвечивание - инструмент преобразования цветов активного слоя
                в соответствующие оттенки серого. Интерфейс панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер толщины кисти</li>
            </ul>

            <p class="pane__topic-disclosure">
                Используя этот инструмент, вы можете удалить цвет из определенной области, преобразовав его в градации серого
                и оставив при этом остальную часть изображения в цвете.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-03 right" @click="view(2)" :src="images[2]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-sharpen</v-icon> Резкость - инструмент повышения резкости. Интерфейс панели управления,
                содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер толщины кисти</li>
                <li>слайдер величины усиления резкости</li>
            </ul>

            <p class="pane__topic-disclosure">
                Процесс повышения резкости осуществляется путем усиления контраста между светлыми и темными пикселями.
                Этот краевой контраст определяется в пределах соседних пикселей или смежной группы пикселей. Усиление
                резкости делает края более чёткими за счет увеличения контраста и создает более резкие переходы между
                светлыми и темными пикселями. Как и предыдуший инструмент, позволяет применять эффект локально.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-04 right" @click="view(3)" :src="images[3]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-blur</v-icon> Размытие - инструмент использует кисть для локального размытия изображения.
                Интерфейс панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер толщины кисти</li>
                <li>слайдер величины размытия</li>
            </ul>

            <p class="pane__topic-disclosure">
                Размытие может быть полезно, если какой-то элемент вашего изображения выделяется слишком сильно, и вы
                хотели бы его смягчить. Если вы хотите размыть весь слой или большую его часть, вам, вероятно,
                будет лучше использовать один из фильтров размытия. Отличительная черта инструмента от аналогичных,
                в десктопных приложениях - его неинкрементальная суть (работа). Т.е. по мере совершения проходов кистью,
                эффект не накапливается, а остается на уровне выставленного значения
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-05 right" @click="view(4)" :src="images[4]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-bulge</v-icon> Линза или выпуклость - инструмент деформации изображения, с целью
                придания ему локального эффекта выпуклости. Интерфейс панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер толщины кисти</li>
                <li>слайдер величины выпуклости</li>
            </ul>

            <p class="pane__topic-disclosure">
                Данный инструмент, для создания эффекта набухания на целевом объекте, сочетает в себе два эффекта -
                "преобразование масштаба" и "радиальный спад".
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-06 right" @click="view(5)" :src="images[5]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-clone</v-icon> Клонирование - инструмент, использующий кисть, для копирования пикселей
                изображения слоя. Интерфейс панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер толщины кисти</li>
            </ul>

            <p class="pane__topic-disclosure">
                Инструмент имеет множество применений: одно из самых важных-это устранение проблемных областей
                на изображении, "закрашивая" их пиксельными данными из других областей. Эта техника требует времени
                для изучения, но в руках опытного пользователя она очень мощна. Еще одно важное применение - рисовать
                узорчатые линии или кривые.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-07 right" @click="view(6)" :src="images[6]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-fill-color</v-icon> Заливка - инструмент заливки, выбранного объекта или его области
                сплошным цветом. Интерфейс панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>палитру выбора цвета заливки</li>
            </ul>

            <p class="pane__topic-disclosure">
                Для обработки применяется алгоритм заливки потоком (flood fill), который определяет область, связанную
                c начальным пикселем (начальная точка распространения заливки), по цветовому атрибуту. Рекурсивно,
                обходя соседние пиксели и тестируя значение цвета на вхождение в диапазон пороговых величин.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-08 right" @click="view(7)" :src="images[7]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-eyedropper</v-icon> Пипетка - используется для выбора цвета из произвольной точки
                изображения. Интерфейс панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>цветовую палитру</li>
            </ul>

            <p class="pane__topic-disclosure">
                Используются цвета только видимых слоёв.
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
                '/img/help/graph-right-01.png',
                '/img/help/graph-right-02.png',
                '/img/help/graph-right-03.png',
                '/img/help/graph-right-04.png',
                '/img/help/graph-right-05.png',
                '/img/help/graph-right-06.png',
                '/img/help/graph-right-07.png',
                '/img/help/graph-right-08.png'
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
                &.dense {
                    & > li {
                        padding: 0;
                    }
                }
            }
            .pane__topic-closing {
                margin: 16px auto;
                text-align: center;
            }
            &.fullscreen:not(.mobile) {
                .pane__images.right.v-image {
                    max-width: 200px !important;
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
