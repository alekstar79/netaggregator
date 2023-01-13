<template>
    <v-layout class="module-header" :class="{ separated }">
        <lazy-widget-text-field v-if="label"
            v-model="value.title"
            v-click-outside="clickOutside"
            class="module-header__input-label"
            :rules="[v => 100 < v.length ? $t('widget.more_100') : true]"
        />
        <v-flex v-else
            v-text="value.title || title"
            @click.stop="label = true"
            class="module-header__top-label"
        />
    </v-layout>
</template>

<script>
    export default {
        props: {
            value: {
                required: true,
                type: Object
            },
            separated: {
                default: false,
                type: Boolean
            },
            optional: {
                default: false,
                type: Boolean
            }
        },
        computed: {
            title() {
                return this.$t(`widget.${this.optional ? 'optional_' : ''}title_100`)
            }
        },
        data: () => ({
            label: false
        }),
        methods: {
            clickOutside()
            {
                this.label = false
            }
        },
        created()
        {
            this.clickOutside()
        },
        mounted()
        {
            this.$emit('update')
        }
    }
</script>

<style lang="scss" scoped>
    .module-header {
        max-height: 34px;
        max-width: 100%;
        padding: 0 5px;

        ::v-deep .v-input.widget__text-field {
            padding: 0;
        }

        &.separated {
            border-bottom: 1px solid #e7e8ec;
            max-height: 41px;
        }
        .module-header__top-label {
            letter-spacing: 0;
            line-height: 40px;
            font-weight: 400;
            color: #000;

            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
</style>
