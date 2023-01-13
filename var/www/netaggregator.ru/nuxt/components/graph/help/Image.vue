<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Блок меню изображение.</h2>

            <!--<p class="pane__topic-definition">
                Раздел справки секция изображение
            </p>-->

            <ul class="features-list with-marks">
                <li class="state-feature">
                    <i class="feature-dashed">ИНФОРМАЦИЯ</i> - активирует/деактивирует иформационную панель

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-01" @click="view(0)" :src="images[0]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">МАСШТАБ+</i> - увеличивает масштаб холста
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">МАСШТАБ-</i> - уменьшает масштаб холста
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ОРИГИНАЛ</i> - выставляет размер холста с масштабом 100%
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ПОДОГНАТЬ</i> - подгоняет размер холста под размеры рабочей области
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ПОВЕРНУТЬ</i> - осуществляет поворот на 45°, выделенного объекта,
                    в случае отсутствия выделения, поворачивает все объекты холста, за исключением объектов,
                    не подверженных повороту (такие как виджеты)
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">V FLIP</i> - применяет отражение по вертикали, аналогично повороту
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">H FLIP</i> - применяет отражение по горизонтали, аналогично повороту
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ПРОЗРАЧНОСТЬ</i> - устанавливает значение прозрачности, аналогично повороту

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(1)" :src="images[1]" />
                        </span>
                    </span>
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">СЕТКА</i> - активирует/деактивирует панель менеджера, координатной сетки

                    <span class="state-hover">
                        <span class="feature">
                            <v-img class="image-04" @click="view(2)" :src="images[2]" />
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
                '/img/help/graph-image-01.png',
                '/img/help/graph-image-02.png',
                '/img/help/graph-image-03.png'
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
