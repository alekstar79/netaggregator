<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Подключение группы</h2>

            <p class="pane__topic-definition">
                Менеджер подключений осуществляет непосредственное подключение того или иного модуля (чатбот, обложки) к
                группе пользователя.
            </p>

            <v-layout class="pane__images justify-flex pc2">
                <v-img class="image-01" @click="view(0)" :src="images[0]" />
                <v-img class="image-02" @click="view(1)" :src="images[1]" />
            </v-layout>

            <p class="pane__topic-disclosure">
                Начальный экран модуля содержит список групп пользователя. При переходе в определенную группу, раскрывается
                список, созданных пользователем сущностей (диалогов для чатбота или обложек), соответствующих данному
                модулю. Выбор возможен только одной сущности. Принцип следующий - сущность (диалог, обложку) можно подключить
                к нескольким группам, в свою очередь, к одной группе, возможно подклучение только одной сущности. В хедере
                окна предусмотрена кнопка выхода назад, в предыдущее окно <helper-return fill="#999" />.
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
                '/img/help/core-connections-01.png',
                '/img/help/core-connections-02.png'
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
            .pane__topic-disclosure svg {
                vertical-align: middle;
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
