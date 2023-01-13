<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Блок меню редактирование.</h2>

            <!--<p class="pane__topic-definition">
                Раздел справки секция редактирование
            </p>-->

            <ul class="features-list with-marks">
                <li class="state-feature">
                    <i class="feature-dashed">ОТМЕНИТЬ [Ctrl + Z]</i> - отменяет последнее действие
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ВЕРНУТЬ [Ctrl + Y]</i> - возвращает отмененное действие
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ВЫРЕЗАТЬ</i> - вырезает, выделенный объект из холста, сохраняя его в буфере
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">КОПИРОВАТЬ</i> - копирует объект в буфер
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ВСТАВИТЬ</i> - вставляет в холст объект из буфера
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">ВЫДЕЛИТЬ ВСЕ</i> - выделяет все объекты на холсте
                </li>

                <li class="state-feature">
                    <i class="feature-dashed">СНЯТЬ ВЫДЕЛЕНИЕ</i> - сбрасывает выделение
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
            images: []
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
                    .feature-dashed {
                        cursor: pointer;
                        padding: 1px 0;
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
