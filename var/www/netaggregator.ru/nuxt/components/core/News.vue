<template>
    <v-container class="pane__topic" :class="{ fullscreen }">
        <h2 class="pane__topic-title mb-5">{{ article.name }}</h2>

        <p v-if="article.definition" class="pane__topic-definition">
            {{ article.definition }}
        </p>

        <v-layout v-if="article.images && article.images.length" class="pane__images left pc1">
            <template v-for="(img, i) in article.images">
                <v-img class="image" :src="`/img/articles/images/${img}`" :alt="`article image-${i}`" :key="i" />
            </template>
        </v-layout>

        <div class="pane__topic-disclosure" v-html="article.disclosure" />

        <div class="clearfix" />
    </v-container>
</template>

<script>
    import linkRouting from '~/mixins/common/link-click-routing'

    export default {
        mixins: [linkRouting],

        props: {
            fullscreen: {
                type: Boolean,
                default: false
            },
            article: {
                type: Object,
                default: () => ({})
            }
        }
    }
</script>

<style lang="scss" scoped>
    .container.pane__topic {
        margin-bottom: 1.2em;

        .pane__images.pc1 {
            margin-bottom: 15px;
        }
        ::v-deep .d-column {
            flex-direction: column;
        }
        ::v-deep a,
        ::v-deep a:active,
        ::v-deep a:hover,
        ::v-deep a:focus,
        ::v-deep a:visited {
            text-decoration: none;
            color: #4c8efb;
        }
        ::v-deep table {
            border-collapse: collapse;
            border-spacing: 10px;

            width: 100%;

            tr {
                border-bottom: 1px solid #ccc;

                &:first-child {
                    border-bottom: 2px solid #ccc;
                }
                &:last-child {
                    border-bottom: none;
                }
            }
            th, td {
                text-align: center;

                &:first-child {
                    text-align: left;
                }
            }
            th {
                padding: 10px 16px;
            }
            td {
                padding: 9px 16px;
            }
        }
        .clearfix::after {
            display: flow-root;
            content: '';
            clear: both;
        }
        &.fullscreen {
            ::v-deep table {
                width: 60%;
            }
        }
    }
</style>
