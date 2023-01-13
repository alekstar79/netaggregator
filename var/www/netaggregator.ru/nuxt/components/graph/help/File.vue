<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Блок меню файл.</h2>

            <!--<p class="pane__topic-definition">
                Раздел справки секция файл
            </p>-->

            <!--<p class="pane__topic-disclosure">
                Блок содержит набор следующих операций:
            </p>-->

            <ul class="features-list with-marks">
                <li class="state-feature">
                    <i class="feature-dashed">НОВЫЙ</i> - предназначен для создания нового холста, вызывает меню выбора
                    размера холста

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-01" @click="view(0)" :src="images[0]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ОТКРЫТЬ</i> - вызывает системное окно выбора и открытия файла, предназначено
                    для загрузки локального изображения в холст

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-02" @click="view(1)" :src="images[1]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ОТКРЫТЬ УРЛ</i> - вызывает диалоговое окно ввода урл, предназначено для
                    загрузки изображения в холст с указанного адреса

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-03" @click="view(2)" :src="images[2]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">WEBCAM</i> - открывает окно захвата видео и загрузки изображения
                    стоп-кадра в холст, при условии если устройство пользователя оснащено вебкамерой

                    <!--<span class="state-hover">
                        <span class="feature">
                            <v-img class="image-02" @click="view(1)" :src="images[1]" />
                        </span>
                    </span>-->
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">PIXABY</i> - вызывает диалоговое окно поиска и загрузки изображений
                    в сервисе pixaby

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(3)" :src="images[3]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ЗАГРУЗИТЬ</i> - вызывает системное окно выбора и открытия документа,
                    предназначено для загрузки локального файла приложения (формат .wxg)

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-05" @click="view(1)" :src="images[1]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">СОХРАНИТЬ</i> - вызывает системный диалог сохранения документа
                    приложения (формат .wxg), если предусмотрено, в противном случае начинается скачивание

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(4)" :src="images[4]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">СКАЧАТЬ</i> - вызывает системный диалог сохранения файла
                    изображения, если предусмотрено, в противном случае начинается скачивание

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(5)" :src="images[5]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">В НОВЫЙ ХОЛСТ</i> - осуществляет перенос, выбранных объектов
                    в новый холст, вызывает меню выбора размера холста

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(0)" :src="images[0]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ВОССТАНОВИТЬ</i> - восстанавливает последнее, сохраненное состояние
                    редактора из локального хранилища
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">УСТАНОВИТЬ</i> - доступно только для вк-обложек, устанавливает
                    созданную модель (документ), в качестве обложки, в список сохраненных
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ЗАКРЫТЬ</i> - закрывает текущее активное окно редактора
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">DATAURL</i> - конвертирует созданный документ в base64 dataurl формат
                    и открывает сконвертированное представление в модальном окне, с возможностью последующего
                    сохранения в файл или копирования в буфер

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(6)" :src="images[6]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ПЕЧАТЬ</i> - открывает системное окно печати текущего документа

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(7)" :src="images[7]" />
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
                '/img/help/graph-file-01.png',
                '/img/help/graph-file-01-1.png',
                '/img/help/graph-file-02.png',
                '/img/help/graph-file-03.png',
                '/img/help/graph-file-03-1.png',
                '/img/help/graph-file-03-2.png',
                '/img/help/graph-file-04.png',
                '/img/help/graph-file-05.png'
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
