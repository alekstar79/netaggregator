<template>
    <lazy-keyboard-cell
        v-bind="cellProps"
        :key="config.id"
        :display="config.display"
        :draggable="internalEditable"
        @delete:content="$emit('delete:content', $event)"
    >
        <div class="Layout" @mousemove="hovered = true" @mouseout="hovered = false" :class="classes">
            <div v-if="config.id !== 0 && internalEditable"
                @mouseleave.stop="moveHovered = false"
                @mouseenter.stop="moveHovered = true"
                class="Layout__move"
            >
                <v-icon>mdi-arrow-all</v-icon>
            </div>

            <template v-for="child in children">
                <lazy-component
                    v-bind="child.props"
                    @delete:content="deleteChild"
                    :initial-config="child"
                    :is="child.component"
                    :editable="editable"
                    :key="child.id"
                    :cell-props="{
                        dragging: child.component === 'keyboard-layout' && cellProps.dragging,
                        isFirstChild: children[0].id === child.id,
                        layoutOrientation: orientation,
                        id: child.id
                    }"
                />
            </template>
        </div>
    </lazy-keyboard-cell>
</template>

<script>
    import { clone, nullConfig } from '~/utils/chatbot'
    import { removeCell } from '~/utils/composer'

    export default {
        name: 'Layout',

        props: {
            initialConfig: Object,
            editable: Boolean,
            cellProps: Object
        },
        computed: {
            layoutConfig() {
                return Object.assign(nullConfig(), clone(this.initialConfig))
            },
            internalEditable() {
                return this.config.id !== 0 ? this.editable : false
            },
            classes() {
                const { internalEditable, moveHovered, orientation, config: { id } } = this

                return {
                    'Layout--move-hovered': id !== 0 && internalEditable && moveHovered,
                    'Layout--horizontal': orientation === 'horizontal',
                    'Layout--vertical': orientation === 'vertical'
                }
            },
            children() {
                return this.config.children || []
            }
        },
        watch: {
            '$store.state.app.window': 'configureForMobile',

            layoutConfig: 'configUpdate'
        },
        data() {
            const config = Object.assign(nullConfig(), clone(this.initialConfig))

            return {
                orientation: config.props.orientation,
                moveHovered: false,
                hovered: false,
                config
            }
        },
        methods: {
            configUpdate(config)
            {
                this.config = config
            },
            getConfig()
            {
                return { ...this.config, children: this.getChildrenConfigurations() }
            },
            getChildrenConfigurations()
            {
                const resolve = c => c ? clone(c.getConfig()) : null

                return this.config.children.map(child => {
                    const fn = c => c.config && c.config.id === child.id
                    return resolve(this.$children[0].$children.find(fn))
                })
                    .filter(Boolean)
            },
            configureForMobile()
            {
                if (typeof window !== 'undefined') {
                    this.orientation = window.innerWidth >= 480
                        ? this.layoutConfig.props.orientation
                        : 'vertical'
                }
            },
            deleteChild(id)
            {
                removeCell(this.config, id)

                this.$emit('remove')
            }
        },
        created()
        {
            this.$nextTick(() => this.configureForMobile())
        }
    }
</script>

<style lang="scss" scoped>
    .Layout {
        display: flex;
        position: relative;
        min-height: 40px;
        padding: 0;
    }
    .Layout--horizontal {
        flex-direction: row;
    }
    .Layout--vertical {
        flex-direction: column;
    }
    .Layout--move-hovered {
        background: #03a696;
        cursor: grab;
    }
    .Layout .Layout--move-hovered > .Layout__move {
        color: #284664;
    }
    .Layout .Layout__move {
        position: absolute;
        left: 2px;
        top: 2px;

        min-width: 50px;
        height: 20px;

        text-align: left;
        font-size: 12px;
        color: #c4c4c4;
        z-index: 2;

        .v-icon {
            font-size: 16px;
        }
    }
    .Layout .Layout__move span {
        margin-left: 2px;
    }
</style>
