<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Левая панель инструментов.</h2>

            <!--<p class="pane__topic-definition">
                Раздел справки секция правый тулбар
            </p>-->

            <v-img class="pane__images image-01 right" @click="view(0)" :src="images[0]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-brush</v-icon> Рисование - инструмент свободного пера. Интерфейс панели управления,
                содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>селект, для выбора типа пера (карандаш, круг, спрей, паттерн)</li>
                <li>слайдер установки толщины пера</li>
                <li>палитра выбора цвета пера</li>
            </ul>

            <p class="pane__topic-disclosure">
                Отрисовка графики, осуществляется перемещением курсора мыши по холсту, с зажатой левой кнопкой мыши.
                По завершении и нажатии кнопки применить <v-icon dense>mdi-check</v-icon>, вся вновь отрисованная
                графика помещается в новый слой.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-02 right" @click="view(1)" :src="images[1]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-shape</v-icon> Фигура - инструмент отрисовки геометрических фигур. В интерфейсе
                панели управления содержится:
            </p>

            <ul class="features-list with-marks dense">
                <li>переключатель выбора геометрии фигуры (линия, прямоугольник, треугольник, эллипс)</li>
                <li>селект выбора типа линии (сплошная, точечная, пунктирная)</li>
                <li>селект установки толщины линии</li>
                <li>палитра цвета обводки</li>
                <li>палитра цвета заливки</li>
            </ul>

            <p class="pane__topic-disclosure">
                Отрисовка фигур, аналогично предыдущему инструменту, осуществляется перемещением курсора мыши по холсту,
                с зажатой левой кнопкой мыши. По завершении перемещения и освобождении левой кнопки, созданная фигура,
                сразу помещается в новый слой. Можно продолжать создавать фигуры далее, изменять настройки, либо
                закрыть панель - инструмент деактивируется. Все созданные фигуры будут находиться в отдельных слоях.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-03 right" @click="view(2)" :src="images[2]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-text</v-icon> Текст - инструмент набора текста. Интерфейс панели управления,
                содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>селект выбора шрифта</li>
                <li>палитру выбора цвета заливки</li>
                <li>палитру выбора цвета обводки</li>
                <li>слайдер установки толщины обводки</li>
            </ul>

            <p class="pane__topic-disclosure">
                Вставка текстового слоя в холст, осуществляется по принципу предыдущих инструментов. При этом,
                текстовое содержимое слоя - шаблонная фраза "TAP AND TYPE", что в адаптивном переводе
                означает - коснись и печатай, передавая тем самым, принцип редактирования созданного слоя.
                Для редактирования текста, необходимо просто кликнуть по тексту, после чего появится курсор и
                программа будет ожидать пользовательского ввода. По завершении набора (редактирования), достаточно
                просто кликнуть в свободном месте рабочей области. Остальные параметры, такие как размер шрифта,
                межсимвольный размер, высота строки, выравнивание и т.д., доступны в панели настроек текста,
                открывающуюся по клику на шестеренку в поле данного текста.
            </p>

            <div class="clearfix" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-reflect-vertical</v-icon> Вертикальное зеркало - отражает выбранный объект по вертикали.
                Не имеет панели настроек.
            </p>

            <div class="clearfix" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-reflect-horizontal</v-icon> Горизонтальное зеркало - отражает выбранный объект по горизонтали.
                Не имеет панели настроек.
            </p>

            <div class="clearfix" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-rotate-right</v-icon> Поворот - осуществляет поворот, выделенного объекта, на 45°.
                В случае отсутствия выделения, поворачивает все объекты холста, за исключением объектов,
                не подверженных повороту (такие как виджеты). Не имеет панели настроек.
            </p>

            <div class="clearfix" />

            <v-img class="pane__images image-04 right" @click="view(3)" :src="images[3]" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-eraser</v-icon> Ластик, применяет эффект ластика к выбранному объекту. Интерфейс
                панели управления, содержит:
            </p>

            <ul class="features-list with-marks dense">
                <li>слайдер толщины ластика</li>
                <li>слайдер прозрачности</li>
                <li>слайдер размытия</li>
            </ul>

            <p class="pane__topic-disclosure">
                Обозначенные параметры, призваны регулировать плавность эффекта (перехода от прозрачного к непрозрачному)
            </p>

            <div class="clearfix" />

            <p class="pane__topic-disclosure">
                <v-icon dense>mdi-crop</v-icon> Обрезка - инструмент обрезки выбранного изображения.
                Не имеет панели настроек, при активации, начинает ожидать манипуляций мышью.
                Необходимо просто зажать левую кнопку мыши и начать выделять прямоугольную область.
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
                '/img/help/graph-left-01.png',
                '/img/help/graph-left-02.png',
                '/img/help/graph-left-03.png',
                '/img/help/graph-left-04.png'
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
