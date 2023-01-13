<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Блок меню инструменты.</h2>

            <!--<p class="pane__topic-definition">
                Раздел справки секция инструменты
            </p>-->

            <ul class="features-list with-marks">
                <li class="state-feature">
                    <i class="feature-dashed">ФИЛЬТРЫ</i> - открывает панель фильтров, для выделенного изображения

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-01" @click="view(0)" :src="images[0]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">АВТОКОРРЕКЦИЯ</i> - автоматическая цветовая коррекция
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ГЛУБИНА ЦВЕТА</i> - установка количества оттенков цвета

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-03" @click="view(1)" :src="images[1]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">КОРРЕКЦИЯ ЦВЕТА</i> - открывает панель ручного управления настройками цвета

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(2)" :src="images[2]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ВЫЦВЕТАНИЕ</i> - открывает панель управления прозрачными пикселями, позволяет
                    у всех пикселей холста, определенного цвета, установить значение прозрачности в ноль. Выбор цвета,
                    осуществляется с палитры или непосредственно с холста.

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-05" @click="view(3)" :src="images[3]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">НАСЫЩЕННОСТЬ</i> - открывает панель управления насыщенностью цвета

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-06" @click="view(4)" :src="images[4]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ЗАМЕНА ЦВЕТА</i> - открывает панель управления заменой цвета. Позволяет
                    заменить пиксели одного цвета (целевого) на пиксели другого (замещающего)

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-07" @click="view(5)" :src="images[5]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ОБРЕЗАТЬ</i> - включает инструмент обрезки (crop) выбранного изображения.
                    Работает без открытия управляющей панели, при включении начинает ожидать манипуляций мыши.
                    Поведение, аналогичное тому, которое применяется во всех распространенных графических редакторах -
                    необходимо просто зажать левую кнопку мыши и начать выделять прямоугольную область.

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-08" @click="view(6)" :src="images[6]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">DYNAMIC</i> - инструмент создания фона из динамически генерируемого изображения.
                    Открывает панель управления выбора и настроек динамических параметров фона, с последующим применением
                    последних и установкой в качестве фона документа.

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-09" @click="view(7)" :src="images[7]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">QR-CODE</i> - генератор qr-кода

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-10" @click="view(8)" :src="images[8]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">C-TEXT</i> - инструмент создания изогнутого (curved) текста

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-11" @click="view(9)" :src="images[9]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">МАСКА</i> - инструмент обрезки изображения по произвольному контуру.
                    Работает без вызова вспомогательных меню и окон. Перед применением, необходимо выбрать
                    изображение для модификации, затем сам инструмент, после чего, программа станет ожидать
                    указание контура, с помощью курсора мыши. Для этого необходимо зажать левую кнопку мыши и обвести
                    ей необходимый контур. После освобождения левой клавиши мыши, программа автоматически замкнет
                    (если требуется) контур и обрежет изображение по созданному контуру.
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ТЕНЬ</i> - инструмент наложения тени. Открывает панель управления
                    настройками тени, для предварительно выбранного объекта. Тень возможно применить ко всем
                    объектам, за исключением виджетов.

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-13" @click="view(10)" :src="images[10]" />
                        </span>
                    </span>
                </li>
            </ul>

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
                '/img/help/graph-tools-01.png',
                '/img/help/graph-tools-02.png',
                '/img/help/graph-tools-03.png',
                '/img/help/graph-tools-04.png',
                '/img/help/graph-tools-05.png',
                '/img/help/graph-tools-06.png',
                '/img/help/graph-tools-07.png',
                '/img/help/graph-tools-08.png',
                '/img/help/graph-tools-09.png',
                '/img/help/graph-tools-10.png',
                '/img/help/graph-tools-11.png'
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

                .state-feature {
                    position: relative;

                    .feature-dashed {
                        border-bottom: 1px dashed;
                    }
                    .state-hover {
                        display: block;
                        margin: 15px 0;

                        .feature {
                            cursor: pointer;
                        }
                    }
                }
                &:not(.with-marks) {
                    & > li {
                        list-style-type: none;
                    }
                }
            }
            .pane__topic-closing {
                margin: 20px auto;
                text-align: center;
            }
            &.fullscreen:not(.mobile) {
                min-height: 89vh;

                .features-list .state-feature {
                    .state-hover {
                        position: absolute;
                        top: 17px;

                        max-width: 300px;
                        height: auto;
                        padding: 10px;
                        margin: 0;

                        box-shadow: rgba(0,0,0,.25) 0 2px 4px;
                        background-color: #ccd8da;
                        border-radius: 7px;
                        display: none;

                        animation: .5s fadein-feature;
                        z-index: 1;

                        .feature {
                            display: block;
                            padding: 10px;
                            margin: 12px 0 0 0;
                            background-color: #f5f5f5;
                            border-radius: 7px;
                        }
                        &:hover {
                            display: block;
                        }
                    }
                    .feature-dashed {
                        cursor: pointer;
                        padding: 1px 0;

                        &:hover + .state-hover {
                            display: block;
                        }
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
