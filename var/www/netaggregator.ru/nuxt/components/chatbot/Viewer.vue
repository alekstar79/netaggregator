<template>
    <v-layout class="attachments-list" wrap>
        <template v-for="(item, idx) in value.attachments">
            <v-flex @click="choose(item, idx)" :key="idx" flat>
                <v-card class="attachments-list__item" flat tile>
                    <v-img :src="item.entity === 'doc'
                        ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                        : item.src"

                        :class="{ doc: item.entity === 'doc' }"
                        :aspect-ratio="1.7"
                    >
                        <v-icon v-if="item.entity === 'doc'">
                            {{ item.icon }}
                        </v-icon>
                    </v-img>

                    <v-card-title class="attachments-list__title">
                        <p :style="{ fontSize }">{{ item.title }}</p>
                        <p :style="{ fontSize }" v-if="item.entity === 'doc'">
                            {{ item.size | format(1) }}
                        </p>
                        <p :style="{ fontSize }" v-else>
                            {{ item.size || item.count }}
                        </p>
                    </v-card-title>

                    <div class="img-overlay">
                        <div class="bg" />
                    </div>

                    <div class="check-marker" @click.stop="mark(idx)">
                        <core-check-marker :close="true" />
                    </div>
                </v-card>
            </v-flex>
        </template>
    </v-layout>
</template>

<script>
    import { format } from '~/utils/common/format.mjs'
    import { removeFromList } from '~/utils/chatbot'

    export default {
        props: {
            value: Object,
            default: () => ({ attachments: [] })
        },
        model: {
            event: 'input',
            prop: 'value'
        },
        filters: {
            format
        },
        computed: {
            fontSize() {
                let w = this.$store.state.app.window.width,
                    f = 9

                switch (true) {
                    case w > 1000: f = 11; break
                    case w > 800:  f = 10; break
                }

                return f + 'px !important'
            },
            color() {
                return this.$store.state.app.color
            }
        },
        methods: {
            mark(idx)
            {
                const attachments = removeFromList([].concat(this.value?.attachments || []), idx)

                this.$emit('input', { ...this.value, attachments })
            },
            choose(item, i)
            {
                const attachments = this.value?.attachments || []

                if (attachments[i]?.entity === 'photo') {
                    const frame = attachments.filter(item => item.entity === 'photo'),
                        idx = frame.findIndex(p => p.url === item.url)

                    this.$bus.$emit('view', { frame, idx })
                }
            }
        },
        mounted()
        {
            this.$emit('update')
        }
    }
</script>

<style lang="scss" scoped>
    .attachments-list {
        & > div {
            flex: 0 1 calc(100% / 3);
        }
        .attachments-list__item {
            position: relative;
            padding: 3px;

            .doc {
                background-color: rgb(250, 251, 252);
                background-position: center center;

                & + div {
                    color: #afbac6 !important;
                }
                .v-responsive__content {
                    display: flex;
                    justify-content: center;
                }
            }
            .check-marker {
                position: absolute;
                right: 0;
                top: 0;

                padding: 7px;
                user-select: none;
                cursor: pointer;
                opacity: .7;
            }
            .img-overlay {
                position: absolute;
                left: 0;
                top: 0;

                padding: 3px;
                height: 100%;
                width: 100%;

                cursor: pointer;

                .bg {
                    height: 100%;
                    width: 100%;

                    background-color: rgba(0,0,0,.2);
                    transition: background-color .5s;
                }
                &:hover .bg {
                    background-color: transparent;
                }
            }
            .attachments-list__title {
                position: absolute;
                left: 0;
                top: 0;

                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                flex-wrap: nowrap;

                padding: 5px;
                height: 100%;
                width: 100%;

                cursor: pointer;
                color: #fff;

                p {
                    display: inline-block;
                    margin: 0;

                    white-space: nowrap;
                    line-height: 1.3em;
                    font-weight: bold;
                    color: inherit;

                    &:first-of-type {
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                }
            }
        }
    }
</style>
