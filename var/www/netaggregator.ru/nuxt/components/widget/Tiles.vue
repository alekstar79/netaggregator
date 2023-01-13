<template>
    <v-layout justify-center>
        <material-card class="module widget-tiles" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 4 }" class="widget-header__title pa-3">
                        {{ $t('widget.tiles') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools @toggle="assignEntity" v-on="$listeners">
                            <template #addon>
                                <v-tooltip :disabled="mobile" nudge-bottom="60">
                                    <template #activator="{ on }">
                                        <v-btn v-on="on" @click="viewToggle" class="addon" aria-label="resize" icon>
                                            <v-icon dense>mdi-resize</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('tooltip.view_switcher') }}</span>
                                </v-tooltip>
                            </template>
                        </lazy-widget-header-tools>
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header v-model="value" v-on="$listeners" />

            <v-layout @wheel.prevent="wheel" class="module-body" ref="box">
                <div class="tile-container d-flex" :style="{ transform }" ref="container">
                    <div v-for="(item, i) in value.tiles || []" :key="`tiles-${i}`" class="d-flex module-body__tile" ref="items">
                        <div @click="openLoader(item)" class="module-body__tile--image-wrapper">
                            <v-img class="module-body__tile--image"
                                :src="item.src || `/img/icons/${size}.jpg`"
                                :aspect-ratio="compact ? 1 : .667"
                                :height="height"
                                alt="image"
                            />
                            <div class="module-body__tile--image-overlay"
                                :style="{ lineHeight: `${height}px` }"
                                v-text="size"
                            />
                        </div>
                        <lazy-widget-text-field
                            v-if="stub[i].title"
                            v-model="item.title"
                            v-click-outside="clickOutside.bind(_self, i, 'title')"
                            class="module-body__tile--title"
                            :rules="[v => v.length > 50 ? $t('widget.more_50') : true]"
                        />
                        <div v-else
                            v-text="item.title || $t('widget.title')"
                            @click="stub[i].title = true"
                            class="module-body__tile--title"
                        />
                        <lazy-widget-text-field
                            v-if="stub[i].descr"
                            v-model="item.descr"
                            v-click-outside="clickOutside.bind(_self, i, 'descr')"
                            class="module-body__tile--descr"
                            :rules="[v => v.length > 50 ? $t('widget.more_50') : true]"
                        />
                        <div v-else
                            v-text="item.descr || $t('widget.description')"
                            @click="stub[i].descr = true"
                            class="module-body__tile--descr"
                        />
                        <div @click="openDialog(item, { name: 'link', link: 'link_url', ln: 50, both: true })"
                            v-text="item.link || $t('widget.link')"
                            class="module-body__tile--action"
                        />
                    </div>
                </div>

                <div class="ui__arrow ui__arrow--left" :class="{ mobile }" :style="{ lineHeight: `${height}px` }">
                    <v-icon v-if="shift > 0" @click="toLeft" aria-label="shift left" dark>
                        mdi-chevron-left
                    </v-icon>
                </div>
                <div class="ui__arrow ui__arrow--right" :class="{ mobile }" :style="{ lineHeight: `${height}px` }">
                    <v-icon v-if="shift < maxshift" @click="toRight" aria-label="shift right" dark>
                        mdi-chevron-right
                    </v-icon>
                </div>
            </v-layout>

            <div @click="openDialog(value, { name: 'more', link: 'more_url', ln: 100, both: true })"
                class="flat_btn load-more__btn"
            >
                <span class="load-more__btn--label">
                    {{ value.more || $t('widget.footer') }}
                </span>
            </div>

            <lazy-widget-link-dialog v-model="link" :set="set" @update="handler" />
            <lazy-widget-load-dialog v-model="load" :set="set" @update="handler" />
        </material-card>
    </v-layout>
</template>

<script>
    import { debounce } from '~/utils/common/debounce.mjs'
    import { extendComputed } from '~/utils/widget'
    import { common, error } from '~/mixins/widget'

    const reset = t => ({ ...t, icon_id: null, src: null }),

        types = ['160x240', '160x160'],
        sizes = ['480x720', '480x480']

    export default {
        mixins: [error, common],

        computed: {
            ...extendComputed('tiles'),

            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            type() {
                return this.compact ? types[1] : types[0]
            },
            size() {
                return this.compact ? sizes[1] : sizes[0]
            },
            height() {
                return this.compact ? 160 : 240
            },
            maxshift() {
                return Math.round(this.max / this.step)
            },
            color() {
                return this.$store.state.app.color
            },
            compact: {
                get() {
                    return this.value.compact
                },
                set(v) {
                    this.value.compact = v
                }
            }
        },
        watch: {
            '$store.state.app.window': 'update',

            shift: {
                handler: 'translate'
            },
            value: {
                deep: true,
                handler() {
                    this.$emit('update')
                    this.measure()
                }
            },
            stub: {
                deep: true,
                handler() {
                    this.$emit('update')
                }
            },
            compact() {
                if (this.switch) {
                    this.value.tiles = this.value.tiles.map(reset)
                }

                this.switch = false
            }
        },
        data: () => ({
            handler: () => {},
            human: 'male',

            transform: 'translateX(0)',
            max: 1172,
            step: 165,
            shift: 0,

            switch: false,
            link: false,
            load: false,

            stub: [],
            set: {}
        }),
        methods: {
            clickOutside(i, field)
            {
                this.stub[i][field] = false
            },
            viewToggle()
            {
                this.switch = true
                this.compact = !this.compact
            },
            translate(v)
            {
                v = v * this.step

                if (this.shift === this.maxshift) {
                    v = this.max
                }
                if (this.shift === 0) {
                    v = 0
                }

                this.transform = `translateX(${v ? `-${v}px` : '0px'})`
            },
            toLeft()
            {
                if (this.shift > 0) {
                    this.shift -= this.shift - 2 < 0 ? 1 : 2
                }
            },
            toRight()
            {
                if (this.shift < this.maxshift) {
                    this.shift += this.shift + 2 > this.maxshift ? 1 : 2
                }
            },
            getRefElements()
            {
                const { container, items, box } = this.$refs

                return { container, item: items[0], box }
            },
            measure()
            {
                const { container, item, box } = this.getRefElements()

                try {

                    this.max = container.clientWidth - box.clientWidth
                    this.step = item.clientWidth + 5

                } catch (e) {
                }
            },
            wheel({ deltaY, wheelDelta })
            {
                const shift = Math.max(-1, Math.min(1, (deltaY || wheelDelta)))

                if ((shift > 0 && this.shift < this.maxshift) || (shift < 0 && this.shift > 0)) {
                    this.shift += shift
                }
            },
            openDialog(value, { name, link, ln = 100, both = false })
            {
                this.set = { name: value[name], link: value[link], ln, both }

                this.handler = set => {
                    this.link = false

                    if (set.close) return

                    value[name] = set.name
                    value[link] = set.link
                }

                this.link = true
            },
            openLoader(item)
            {
                this.set = { type: this.type, widget: 'tiles' }

                this.handler = set => {
                    this.load = false

                    if (set) {
                        item.src = set.id ? set.images[set.images.length - 1].url : `/img/icons/${this.size}.jpg`
                        item.icon_id = set.id
                    }
                }

                this.load = true
            },
            assignEntity(entity)
            {
                this.human = entity
            },
            clear()
            {
                this.stub = Array.from(((this.value || {}).tiles || []), () => ({ title: false, descr: false }))
            },
            update: debounce(function() {
                this.measure()
            }, 0)
        },
        mounted()
        {
            this.update()

            this.$emit('update')
        },
        created()
        {
            this.clear()
        }
    }
</script>

<style lang="scss" scoped>
    .widget-tiles {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 15px 0;
                overflow: hidden;

                .ui__arrow {
                    position: absolute;
                    cursor: pointer;
                    opacity: 0;

                    button.v-icon {
                        background-color: rgba(0,0,0,.3);
                        border-radius: 50%;
                        padding: 3px;
                    }
                    &.ui__arrow--right {
                        right: 20px;
                    }
                    &.ui__arrow--left {
                        left: 20px;
                    }
                    &.mobile {
                        opacity: .7;
                    }
                }
                &:hover .ui__arrow {
                    opacity: .7;
                }
                .tile-container {
                    position: relative;
                    justify-content: space-around;
                    flex-wrap: nowrap;

                    transition: transform .4s ease;

                    .module-body__tile {
                        padding: 0 5px;
                        width: 160px;

                        flex-direction: column;
                        text-decoration: none;
                        vertical-align: top;
                        line-height: 15px;

                        &:first-child {
                            padding: 0 5px 0 0;
                        }
                        &:last-child {
                            padding: 0 0 0 5px;
                        }
                        .module-body__tile--image-wrapper {
                            position: relative;
                            cursor: pointer;

                            .module-body__tile--image {
                                display: block;
                                width: 100%;

                                background-position: 50%;
                                background-size: cover;
                                border-radius: 2px;
                            }
                            .module-body__tile--image-overlay {
                                position: absolute;
                                left: 0;
                                top: 0;

                                height: 100%;
                                width: 100%;

                                border-radius: 2px;
                                transition: opacity 40ms linear;
                                background-color: #000;
                                color: white;
                                opacity: 0;

                                text-align: center;
                                font-size: 1.2rem;
                            }
                            &:hover .module-body__tile--image-overlay {
                                opacity: .5;
                            }
                        }
                        .module-body__tile--action,
                        .module-body__tile--descr,
                        .module-body__tile--title {
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            vertical-align: top;
                            overflow: hidden;
                            max-width: 100%;

                            &.v-input {
                                padding: 1px !important;
                            }
                        }
                        .module-body__tile--title {
                            padding-top: 7px;
                        }
                        .module-body__tile--descr {
                            padding-top: 3px;
                            font-size: 12px;
                            color: #939699;
                        }
                        .module-body__tile--action {
                            padding-top: 3px;
                            cursor: pointer;
                        }
                    }
                }
            }
        }
        &.theme--dark {
            .widget-header {
                color: #7a7a7a;

                ::v-deep .header-tools {
                    .v-btn.v-btn--icon {
                        color: #7a7a7a;
                    }
                }
            }
            ::v-deep .v-card__text {
                .module-header .module-header__top-label {
                    color: #7a7a7a;
                }
                .module-body {
                    .module-body__tile {
                        color: #7a7a7a;
                    }
                }
                .load-more__btn {
                    border-top: 1px solid #424242;
                    background-color: #1e1e1e;
                    color: #7a7a7a;

                    &:hover {
                        background-color: #424242;
                    }
                }
            }
        }
    }
</style>
