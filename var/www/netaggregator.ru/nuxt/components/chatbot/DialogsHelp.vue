<template>
    <v-layout class="pane scroller" :class="`theme--${$vuetify.theme.dark ? 'dark' : 'light'}`">
        <v-container class="pane__topic" :class="{ fullscreen, mobile }">
            <h2 class="pane__topic-title mb-5">Редактор диалогов чатбота.</h2>

            <p class="pane__topic-definition">
                Редактор диалогов - программный модуль, предоставляющий возможность, спроектировать цепочку развития диалога
                с конечным пользователем (далее собеседник). Диалог, в концепции редактора, представляет собой древовидную
                структуру вопросов и ответов, реализующую всевозможные альтернативы развития диалога с собеседником,
                определяемые создателем диалога.
            </p>

            <v-layout class="pane__images right" column>
                <v-img class="image-01" @click="view(0)" :src="images[0]" />
                <v-img class="image-02" @click="view(1)" :src="images[1]" />
            </v-layout>

            <p class="pane__topic-disclosure">
                Начальный экран редактора - это список, всех созданных пользователем диалогов. Диалоги не имеют жестой привязки
                и могут быть подключены к любой группе пользователя из списка подключений. Название диалога в списке, может
                быть задано и отредактировано в смысловом контексте и предпочтениями пользователя, простым кликом по названию и
                последующим набором требуемого. Каждый пункт (диалог) в списке имеет следующие элементы управления,
                представленные соответствующими иконками:
            </p>

            <ul class="features-list">
                <li><v-icon dense>mdi-pencil</v-icon> редактировать </li>
                <li><v-icon dense>mdi-content-copy</v-icon> копировать </li>
                <li><v-icon dense>mdi-trash-can-outline</v-icon> удалить </li>
            </ul>

            <p class="pane__topic-disclosure">
                Удаление и копирование, выполняют соответствующие операции, применительно к диалогу в целом, без вызова
                дополнительных попап-меню. Но требующих, для подтверждения внесения изменений на сервере, нажатия кнопки
                сохранить <v-icon dense>mdi-content-save</v-icon> в шапке (header) окна модуля или отмены действия,
                путем нажатия кнопки релоад <v-icon dense>mdi-sync</v-icon> (sync).
            </p>

            <p class="pane__topic-disclosure">
                Редактирование диалога переключает основное окно редактора в режим редактирования структуры. Если это вновь созданный
                и еще пустой диалог, то в окне редактирования отображается уведомление о том, что реплики не настроены и
                под ним кнопка добавления первой реплики. Реплика, в терминологии приложения - это атомарное звено вопрос -> ответ.
                Если происходит редактирование уже существующего диалога, то соответственно в окне редактирования отображается
                иерархическая структура цепочки реплик данного диалога. Которые в свою очередь, имеют аналогичные списку,
                элементы управления (редактировать, копировать, удалить) с тем же функционалом, но применительно к конкретной
                ветки диалога. Формирование самой же структуры, осуществляется путем перетаскивания между собой, отдельно созданных
                реплик (звеньев), а так же перемещение одних внутрь других. Названия ветки диалога формируется автоматически
                на основании вопросов звена верхнего уровня, в данной ветки диалога.
            </p>

            <v-layout class="pane__images left" mb-3 column>
                <v-img class="image-03" @click="view(2)" :src="images[2]" />
                <v-img class="image-04" @click="view(3)" :src="images[3]" />
            </v-layout>

            <p class="pane__topic-disclosure">
                Редактирование отдельного звена, переводит окно редактирования структуры в режим редактирования звена. В этом
                окне отображается два поля ввода, переключатели режимов обработки введенных данных, над соответствующими полями,
                в виде выпадающих списков, а также блок вложений (attachments) внизу, если таковые определены в данном звене.
                Верхнее поле для ввода вопроса, может обрабатываться в режиме точного совпадения или в режиме - содержит одно
                из ключевых слов. Ввод слов, фраз, предложений, осуществляется непосредственным набором на клавиатуре. Поле
                ответа, обрабатывается в режимах случайного ответа или по условию. Имеет смысл только при условии нескольких
                вариантов ответа. Ввод ответа производится путем нажатия кнопки добавить <v-icon dense>mdi-plus-circle-outline</v-icon>,
                после чего открывается всплывающее окно редактирования ответа. Данное окно содержит текстовую область, для
                ввода собствено текста ответа, а также инструменты редактирования:
            </p>

            <ul class="features-list reply-edit">
                <li><v-icon dense>mdi-keyboard-outline</v-icon> клавиатуры бота </li>
                <li><v-icon dense>mdi-paperclip</v-icon> вложения </li>
                <li><v-icon dense>mdi-code-braces</v-icon> добавление переменных </li>
                <li><v-icon dense>mdi-emoticon-happy-outline</v-icon> эмотиконы </li>
            </ul>

            <p class="pane__topic-disclosure">
                Отдельным блоком идут фильтры, которые используются в режиме ответа "по условию". Что позволяет осуществлять алгоритму,
                выбор различных вариантов ответа в зависимости от категории собеседника, которая в свою очередь и определяется
                этими фильтрами. Установка фильтров производится в этом же окне, во вкладке фильтры
                <v-icon dense>mdi-filter-outline</v-icon>. Вложения могут прикреплятся как на уровне звена, так и на уровне
                любого из вариантов ответов, приоритет в таком случае отдается конкретному варианту ответа. Если в ответе,
                вложения не определены, прикрепляются те что определены для реплики в целом. Не определены для реплики - не
                прикрепляется ничего. Вложения формируются из медиафайлов групп(ы) - фото, видео и документы. Т.е. возможно
                прикреплять любые файлы из всего доступного пользователю списка групп. Окно редактирования клавиатуры, предоставляет
                следующие инструменты:
            </p>

            <ul class="features-list keyboard-tools">
                <li><v-icon dense>mdi-pencil</v-icon> редактировать </li>
                <li><v-icon dense>mdi-content-copy</v-icon> сохранить </li>
                <li><v-icon dense>mdi-playlist-plus</v-icon> добавить ряд </li>
                <li><v-icon dense>mdi-view-grid-plus</v-icon> добавить кнопку </li>
            </ul>

            <p class="pane__topic-disclosure">
                Положение кнопок определяется перетаскиванием последних в поле редактирования. Назначение цвета, лэйбла
                и команды каждой индивидуальной кнопки, задается в отдельном диалоговом окне, по нажатию на значок
                редактирования на соответствующей кнопке. Обработка команды прописывается пользователем самостоятельно,
                в логике бота. Как и вложения, клавиатура определятся как для реплики в целом, так и индивидуально,
                для каждого ответа с той же приоритетностью, но в отличии от вложений, может быть определена дефолтная
                клавиатура для всего диалога в целом. Назначается в общих настройках диалога <v-icon dense>mdi-cog</v-icon>.
                Там же возможно указать список ответов по умолчанию, используемых в случаях таких фраз собеседника, соответствие
                которым не удалось определить.
            </p>

            <v-layout class="pane__images justify-flex pc3" column>
                <v-img class="image-05" @click="view(4)" :src="images[4]" />
                <v-img class="image-06" @click="view(5)" :src="images[5]" />
                <v-img class="image-07" @click="view(6)" :src="images[6]" />
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
                '/img/help/chatbot-dialogs-01.png',
                '/img/help/chatbot-dialogs-02.png',
                '/img/help/chatbot-dialogs-03.png',
                '/img/help/chatbot-dialogs-04.png',
                '/img/help/chatbot-dialogs-05.png',
                '/img/help/chatbot-dialogs-06.png',
                '/img/help/chatbot-dialogs-07.png'
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
                    list-style-type: none;
                    padding: 5px;

                    .v-icon {
                        margin-right: 5px;
                    }
                }
                &.keyboard-tools {
                    display: flex;
                    justify-content: space-around;
                    padding-left: 0;
                }
            }
            .pane__topic-closing {
                margin: 20px auto;
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
    @media all and (max-width: 761px) {
        .pane.scroller .container {
            .reply-edit {
                display: flex;
                justify-content: space-around;
                padding-left: 0 !important;
                padding-bottom: 16px;
            }
        }
    }
    @media all and (max-width: 661px) {
        .pane.scroller .container {
            .keyboard-tools,
            .reply-edit {
                flex-direction: column;
                justify-content: unset;
                padding-left: 24px !important;
            }
        }
    }
</style>
