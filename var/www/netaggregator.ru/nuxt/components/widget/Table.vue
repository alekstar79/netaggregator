<template>
    <v-layout justify-center>
        <material-card class="module widget-table" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 3 }" class="widget-header__title pa-3">
                        {{ $t('widget.table') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools @toggle="assignEntity" v-on="$listeners" />
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header v-model="value" v-on="$listeners" />

            <v-layout class="module-body" column>
                <v-layout>
                    <v-flex>
                        <table class="module-body__table">
                            <tbody>
                                <tr>
                                    <th class="module-body__cell--icon">
                                        <div class="avatar-wrapper">
                                            <v-avatar size="25" />
                                        </div>
                                    </th>
                                    <th v-for="(hc, i) in value.head || []"
                                        class="module-body__table--th"
                                        :class="setCellClasses(hc, i)"
                                        @click="alignDialog(hc, i)"
                                        :key="`table-head-${i}`"
                                    >
                                        {{ hc.text || $t('widget.title') }}
                                        <v-btn v-if="cols > 1"
                                            @click.stop="removeCol(i)"
                                            class="cross-button"
                                            :ripple="false"
                                            icon
                                        >
                                            <v-icon x-small>
                                                mdi-close
                                            </v-icon>
                                        </v-btn>
                                    </th>
                                </tr>

                                <tr v-for="(row, r) in value.body || []" :key="`table-row-${r}`">
                                    <td class="module-body__cell--icon">
                                        <div @click="openLoader(row[0], '24x24')" class="avatar-wrapper">
                                            <v-avatar size="25">
                                                <img :src="row[0].src" width="25px" height="25px" alt="icon">
                                            </v-avatar>

                                            <div class="avatar-overlay">+</div>
                                        </div>
                                    </td>
                                    <td v-for="(bc, i) in row"
                                        @click="openDialog(bc, { name: 'text', link: 'url', idx: r, cell: i, ln: 100 })"
                                        class="module-body__table--td"
                                        :class="setCellClasses(bc, i)"
                                        :key="`table-cell-${i}`"
                                    >
                                        {{ bc.text || $t('widget.cell') }}
                                        <v-btn
                                            v-if="rows > 1 && i === 0"
                                            @click.stop="removeRow(r)"
                                            class="cross-button"
                                            :ripple="false"
                                            icon
                                        >
                                            <v-icon x-small>
                                                mdi-close
                                            </v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </v-flex>

                    <div v-if="cols < 5" @click="addCol" class="flat_btn add-item__btn vert" :style="{ lineHeight }">
                        <span class="load-more__btn--label">+</span>
                    </div>
                </v-layout>

                <div v-if="rows < 10" @click="addRow" class="flat_btn add-item__btn slim mt-2">
                    <span class="load-more__btn--label">+</span>
                </div>
            </v-layout>

            <div @click="openDialog(value, { name: 'more', link: 'more_url', ln: 100, both: true })"
                class="flat_btn load-more__btn"
            >
                <span class="load-more__btn--label">
                    {{ value.more || $t('widget.footer') }}
                </span>
            </div>

            <lazy-widget-align-dialog v-model="align" :set="set" @update="handler" />
            <lazy-widget-link-dialog v-model="link" :set="set" @update="handler" />
            <lazy-widget-load-dialog v-model="load" :set="set" @update="handler" />
        </material-card>
    </v-layout>
</template>

<script>
    import { tableHead, tableBody } from '~/assets/data/widget'
    import { extendComputed, clone } from '~/utils/widget'
    import { common, error } from '~/mixins/widget'

    export default {
        mixins: [error, common],

        computed: {
            ...extendComputed('table'),

            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            },
            lineHeight() {
                return  31 * (this.rows + 1) + 'px'
            },
            rows() {
                return this.value.body.length
            },
            cols() {
                return this.value.head.length
            }
        },
        watch: {
            data: {
                deep: true,
                handler() {
                    this.$emit('update')
                }
            }
        },
        data: () => ({
            handler: () => {},
            human: 'male',

            align: false,
            link: false,
            load: false,

            set: {}
        }),
        methods: {
            setCellClasses(cell, i)
            {
                const linked = cell.url ? 'module-body__table-linked ' : ''

                return linked + this.value.head[i].align
            },
            addRow()
            {
                if (this.rows >= 10) return

                const body = this.value.body.slice()

                body.push(Array.from(this.value.head, tableBody))

                this.value = { ...this.value, body }
            },
            removeRow(idx)
            {
                const body = this.value.body.filter((_,i) => i !== idx)

                this.value = { ...this.value, body }
            },
            addCol()
            {
                if (this.cols >= 5) return

                const value = clone(this.value)

                value.head.push(tableHead())
                value.body.forEach(row => row.push(tableBody()))

                this.value = value
            },
            removeCol(idx)
            {
                const body = this.value.body.map(row => row.filter((_,i) => i !== idx)),
                    head = this.value.head.filter((_,i) => i !== idx)

                this.value = { ...this.value, head, body }
            },
            alignDialog(value, idx)
            {
                const remove = this.value.head.length > 1

                this.set = { text: value.text, ln: 50, remove }

                this.handler = set => {
                    this.align = false

                    if (set.close) return

                    if (set.remove) {
                        return this.removeCol(idx)
                    }

                    value.align = set.align
                    value.text = set.text
                }

                this.align = true
            },
            openDialog(value, { idx, cell, name, link, ln = 100, both = false })
            {
                const remove = this.value.body.length > 1 && cell === 0

                this.set = { name: value[name], link: value[link], remove, ln, both }

                this.handler = set => {
                    this.link = false

                    if (set.close) return

                    if (set.remove) {
                        return this.removeRow(idx)
                    }

                    value[name] = set.name
                    value[link] = set.link
                }

                this.link = true
            },
            openLoader(item, type)
            {
                this.set = { type, widget: 'table' }

                this.handler = set => {
                    this.load = false

                    if (set) {
                        item.src = set.id ? set.images[set.images.length - 1].url : '/img/icons/150x150.png'
                        item.icon_id = set.id
                    }
                }

                this.load = true
            },
            assignEntity(entity)
            {
                this.human = entity
            }
        },
        mounted()
        {
            this.$emit('update')
        }
    }
</script>

<style lang="scss" scoped>
    .widget-table {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 12px 15px 15px;
                justify-content: space-around;

                .module-body__table {
                    box-sizing: border-box;
                    width: 100%;
                    padding: 0;
                    margin: 0;

                    user-select: none;

                    .left, .right {
                        float: unset !important;
                    }
                    .module-body__cell--icon {
                        padding-right: 10px;
                        width: 25px;

                        .avatar-wrapper {
                            position: relative;
                            height: 25px;
                            width: 25px;

                            cursor: pointer;

                            .avatar-overlay {
                                position: absolute;
                                left: 0;
                                top: 0;

                                height: 100%;
                                width: 100%;

                                border-radius: 50%;
                                transition: opacity 40ms linear;
                                background-color: #000;

                                text-align: center;
                                line-height: 25px;
                                font-size: 1.5rem;
                                color: white;
                                opacity: 0;
                            }

                            &:hover .avatar-overlay {
                                opacity: .5;
                            }
                        }
                    }
                    .module-body__table--td,
                    .module-body__table--th {
                        max-width: 100px;
                        padding: 0;
                        margin: 0;

                        font-size: 12px;
                        vertical-align: middle;
                        line-height: 15px;
                        color: #000;

                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        text-align: left;
                        cursor: pointer;

                        -webkit-font-smoothing: subpixel-antialiased;
                                       -moz-osx-font-smoothing: auto;

                        .cross-button {
                            height: 17px;
                            width: 17px;
                            margin: 0;

                            background-color: #f0f2f5;
                            transition: opacity 40ms linear;
                            opacity: 0;
                        }
                        &.module-body__table-linked {
                            color: #2a5885;
                        }
                        &:hover .cross-button {
                            opacity: 1;
                        }
                    }
                    .module-body__table--th {
                        padding-bottom: 10px;
                        font-weight: 500;
                    }
                    .module-body__table--td {
                        padding: 9px 0;
                        font-weight: 400;
                    }
                    .module-body__table--td + .module-body__table--td,
                    .module-body__table--th + .module-body__table--th {
                        padding-left: 10px;
                    }
                    .module-body__table--td.left,
                    .module-body__table--th.left {
                        text-align: left;
                    }
                    .module-body__table--td.center,
                    .module-body__table--th.center {
                        text-align: center;
                    }
                    .module-body__table--td.right,
                    .module-body__table--th.right {
                        text-align: right;
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
                    .module-body__table {
                        .module-body__table--th,
                        .module-body__table--td {
                            color: #7a7a7a;
                        }
                    }
                }
                .load-more__btn,
                .module-body .add-item__btn {
                    background-color: #1e1e1e;
                    color: #7a7a7a;

                    &:hover {
                        background-color: #424242;
                    }
                }
                .load-more__btn {
                    border-top: 1px solid #424242;
                }
            }
        }
    }
</style>
