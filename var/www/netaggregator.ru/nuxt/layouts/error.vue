<template>
    <v-container class="error-page text-center">
        <v-layout fill-height justify-center align-center>
            <v-flex>
                <h1 :class="`${$store.state.app.color}--text`" class="error-code">
                    {{ error.statusCode === 404 ? '404' : '500' }}
                </h1>

                <h2 class="my-3 headline">{{ $t('common.wrong') }}</h2>

                <p>{{ $t(`common.${error.statusCode === 404 ? 'incorrect' : 'server_error'}`) }}</p>
                <p>{{ $t(`common.${error.statusCode === 404 ? 'working' : 'try_again'}`) }}</p>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        name: 'LayoutError',

        head() {
            return {
                title: this.error.statusCode === 404 ? this.pageNotFound : this.otherError,
                meta: [
                    {
                        name: 'description',
                        hid: 'description',
                        content: 'Агрегированный инструментарий для администраторов сообществ Вконтакте, позволяющий придать выразительности и уникальности группе, а так же взаимодействовать с аудиторией. В набор включены такие сервисы как - динамическая обложка, виджеты, чат-бот, стримридер и графический редактор.'
                    },
                    {
                        name: 'og:url',
                        hid: 'og:url',
                        content: 'https://netaggregator.ru'
                    }
                ]
            }
        },
        created()
        {
            this.$bus.$emit('loading:finish')
        },
        data: () => ({
            otherError: 'An error occurred',
            pageNotFound: '404 Not Found'
        }),
        props: {
            error: {
                type: Object,
                default: null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .error-page::v-deep {
        height: 100%;

        h1.error-code {
            line-height: 5vmin;
            font-size: 20vmin;

            text-shadow:
                rgba(61,61,61,.3) 1px 1px,
                rgba(61,61,61,.2) 2px 2px,
                rgba(61,61,61,.3) 3px 3px;
        }
        h2, p {
            color: #7a7a7a;
        }
    }
</style>
