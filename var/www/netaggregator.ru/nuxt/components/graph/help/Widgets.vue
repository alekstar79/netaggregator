<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Виджеты.</h2>

            <p class="pane__topic-definition">
                Виджеты представляют из себя не просто графические примитивы, это группа объектов с определенным
                поведением и внутренней логикой, объединенные уникальным представлением и одной моделью данных.
                Как правило это иконка виджета и один или несколько текстовых блоков, отражающие ту или иную
                информацию, соответствующую данному типу виджета. Каждый виджет, предоставляет возможность модификации
                его размеров, геометрии и позиционирования элементов как в контексте холста, так и относительно друг
                друга. Позиционирование виджета на холсте, осуществляется аналогично остальным графическим примитивам -
                обычным перетаскиванием мыши. Позиционирование отдельных компонентов виджета, становится доступно
                при разгруппировки последних, посредством двойного клика по виджету, а точнее по одному из его
                компонентов, позицию или размер которого требуется изменить. Хотя, так же поддерживается и переключение
                между компонентами для модификации, простым выбором мышью (<i>left clk</i>). Как и в остальных
                графических объектах, в виджетах присутствует меню инструментов, доступное по клику на иконку
                шестеренки виджета <v-icon dense>mdi-cog</v-icon> или через менеджер слоев (<i>п. Settings</i>),
                с набором индивидуальных инструментов, согласно типу виджета.
            </p>

            <v-layout class="pane__images justify-flex pc2" column>
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
                '/img/help/graph-widgets-01.png',
                '/img/help/graph-widgets-02.png'
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
        .container {
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
