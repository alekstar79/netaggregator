<template>
    <div class="Layout_Cell"
        @mousemove.stop="onMouseMove"
        @mouseout.stop="hovered = false"
        @dragend.stop="$emit('internal:dragend', $event)"
        @dragstart="$emit('internal:dragstart', $event)"
        @drag.stop="$emit('internal:drag', $event)"
        v-bind="{ id: `cell-${id}`, class: classes, style, draggable }"
    >
        <div v-if="draggable" class="Layout_Cell__actions">
            <span v-if="$parent.$options.name !== 'Layout'" @click="$emit('edit:content', id)" class="Layout_Cell__edit">
                <v-icon dense>mdi-square-edit-outline</v-icon>
            </span>
            <span v-if="$parent.$options.name !== 'Layout' || !$parent.config.children.length"
                @click="$emit('delete:content', id)"
                class="Layout_Cell__delete"
            >
                <v-icon dense>mdi-trash-can-outline</v-icon>
            </span>
        </div>

        <slot />
    </div>
</template>

<script>
    import { extractCellId, getChildren, getParentId, getPrevSiblingId, moveCellToPlaceholderPosition } from '~/utils/composer-ui'
    import { moveElementToNewPosition } from '~/utils/composer'

    /**
    * @see https://github.com/ivanjolic95/vue-layout-composer
    */
    export default {
        name: 'Cell',

        props: {
            id: Number,
            layoutOrientation: String,
            isFirstChild: Boolean,
            draggable: Boolean,
            dragging: Boolean,
            display: Object
        },
        data: () => ({
            parentLayoutComponent: null,
            lastLayoutComponent: null,
            prevParentId: null,
            placeholderEl: null,
            lastLayoutEl: null,
            targetEl: null,

            mousePosInElX: 0,
            mousePosInElY: 0,

            hovered: false,
            dropped: false
        }),
        computed: {
            style() {
                let marginLeft, marginTop, grow = {}

                if (this.layoutOrientation) {
                    if (this.layoutOrientation === 'horizontal') {
                        marginLeft = this.isFirstChild ? '0px' : '8px'
                    } else {
                        marginTop = this.isFirstChild ? '0px' : '8px'
                    }
                }
                if (this.display) {
                    grow = { flexGrow: this.display.weight }
                }

                return {
                    marginLeft,
                    marginTop,
                    ...grow
                }
            },
            classes() {
                const { draggable, hovered, dragging, dropped, id } = this

                return {
                    'Layout_Cell--hovered': draggable && hovered,
                    'Layout_Cell--dragging': id > 0 && dragging,
                    'Layout_Cell--dropped': dropped
                }
            },
            isFirefox() {
                return !!(this.$BROWSER || {}).IS_FIREFOX
            }
        },
        watch: {
            dragging(v) {
                this.dropped = !v
            }
        },
        methods: {
            onMouseMove()
            {
                this.hovered = !window.isDragging
            },
            setMousePositionInDraggedElement({ target, clientX, clientY })
            {
                const rect = target.getBoundingClientRect(),
                    x = clientX - rect.left,
                    y = clientY - rect.top,

                    dragAreaTreshold = 10

                this.mousePosInElX = x > dragAreaTreshold ? dragAreaTreshold : x
                this.mousePosInElY = y > dragAreaTreshold ? dragAreaTreshold : y
            },
            createPlaceholderElement()
            {
                if (this.placeholderEl) return

                let $placeholderChild = document.createElement('div'),
                    $placeholderEl = document.createElement('div'),
                    $placeholderText = document.createElement('p'),
                    { targetEl } = this

                $placeholderText.style.position = 'absolute'
                $placeholderText.style.top = '50%'
                $placeholderText.style.width = '100%'
                $placeholderText.style.marginBottom = '0px'
                $placeholderText.style.marginTop = '0px'
                $placeholderText.style.textAlign = 'center'
                $placeholderText.style.transform = 'translateY(-50%)'
                $placeholderText.textContent = 'Drop'

                $placeholderChild.prepend($placeholderText)

                const child = Array.from(targetEl.children).filter(el => !el.className.includes('Layout_Cell__actions'))[0]

                $placeholderChild.style.minHeight = window.getComputedStyle(child).getPropertyValue('min-height')
                $placeholderChild.style.height = '100%'

                $placeholderChild.style.display = 'block'

                $placeholderEl.addEventListener('dragover', e => {
                    e.preventDefault()
                })

                $placeholderEl.className = 'Layout_Cell--placeholder'
                $placeholderEl.style.flexGrow = targetEl.style.flexGrow || '1'
                $placeholderEl.style.opacity = '1'

                $placeholderEl.prepend($placeholderChild)

                this.placeholderEl = $placeholderEl
            },
            onDragStart(e)
            {
                if (!this.draggable || window.isDragging) return

                window.isDragging = true
                window.targetEl = this.targetEl = e.target

                this.prevParentId = getParentId(e.target)

                this.setMousePositionInDraggedElement(e)

                e.dataTransfer.setData('text/plain', this.targetEl.id)

                this.createPlaceholderElement()
            },
            getUnderlyingLayoutEl(startX, startY)
            {
                const fn = el => el.className && el.className.includes('Layout ')

                return document
                    .elementsFromPoint(startX, startY)
                    .find(fn)
            },
            setLayoutComponent($layoutEl)
            {
                let layoutComponent, $currEl = $layoutEl

                while ($currEl) {
                    if ($currEl.__vue__) {
                        layoutComponent = $currEl.__vue__.$options.name === 'Cell'
                            ? $currEl.__vue__.$parent
                            : $currEl.__vue__

                        $currEl = null
                    } else {
                        $currEl = $currEl.parentNode
                    }
                }

                if (layoutComponent) {
                    this.lastLayoutComponent = layoutComponent
                }
                if ($layoutEl) {
                    this.lastLayoutEl = $layoutEl
                }
            },
            emphasizeCurrentLayout()
            {
                document.querySelectorAll('.Layout_Cell--emphasized').forEach(el => {
                    el.className = el.className.replace(/Layout_Cell--emphasized/, '')
                })

                if (this.lastLayoutComponent &&
                    this.lastLayoutComponent.$parent.$options.name !== 'Layout') {
                    this.lastLayoutComponent.$children[0].$el.className = `${
                        this.lastLayoutComponent.$children[0].$el.className
                    } Layout_Cell--emphasized`
                }
            },
            getSiblingsFromLayout()
            {
                const { targetEl, lastLayoutEl } = this

                return ((lastLayoutEl &&
                    Array.from(lastLayoutEl.children).filter($el => {
                        return $el.__vue__ && (!targetEl || $el.__vue__.id !== targetEl.__vue__.id)
                    })
                ) || [])
            },
            appendPlaceholderToDOM($siblings, startX, startY)
            {
                let { targetEl, placeholderEl, lastLayoutComponent, lastLayoutEl } = this,
                    PLACEHOLDER = 'Layout_Cell--placeholder',

                    minDistance = Infinity,
                    $childBeforeEl = null

                if (!placeholderEl) return

                $siblings.forEach($el => {
                    let { x, y } = $el.getBoundingClientRect()

                    switch (lastLayoutComponent.$attrs.orientation) {
                        case 'horizontal':
                            placeholderEl.style.marginTop = '0px'
                            placeholderEl.style.marginLeft = '8px'

                            if ($el.previousSibling &&
                                $el.previousSibling.className &&
                                $el.previousSibling.className.indexOf('move')) {
                                x += $el.clientWidth / 2
                            }
                            if (x < startX && minDistance > startX - x) {
                                minDistance = startX - x
                                $childBeforeEl = $el
                            }

                            break
                        case 'vertical':
                            placeholderEl.style.marginTop = '8px'
                            placeholderEl.style.marginLeft = null

                            if ($el.previousSibling &&
                                $el.previousSibling.className &&
                                $el.previousSibling.className.indexOf('move')) {
                                y += $el.clientHeight / 2
                            }
                            if (y < startY && minDistance > startY - y) {
                                minDistance = startY - y
                                $childBeforeEl = $el
                            }
                    }
                })

                if ($childBeforeEl && (
                   ($childBeforeEl.nextSibling && $childBeforeEl.nextSibling.className === PLACEHOLDER) ||
                   ($childBeforeEl.nextSibling === targetEl && targetEl.style.display && targetEl.style.display !== 'none')
                )) {
                    return
                }
                if (!$childBeforeEl && lastLayoutEl && lastLayoutEl.children &&
                    lastLayoutEl.children[0].className === PLACEHOLDER
                ) {
                    return
                }

                document.querySelectorAll(`.${PLACEHOLDER}`)
                    .forEach(el => el.remove())

                targetEl.style.display = 'none'

                $childBeforeEl &&
                $childBeforeEl.parentNode.insertBefore(
                    placeholderEl,
                    $childBeforeEl.nextSibling
                )

                !$childBeforeEl && lastLayoutEl && lastLayoutEl.prepend(placeholderEl)

                if (!lastLayoutComponent) return

                if (lastLayoutComponent.$attrs.orientation === 'horizontal') {
                    placeholderEl.style.marginTop = '0px'
                    placeholderEl.style.marginBottom = '0px'

                    if (!placeholderEl.previousSibling) {
                        placeholderEl.style.marginLeft = '0px'

                        if (placeholderEl.nextSibling) {
                            placeholderEl.style.marginRight = '8px'
                        }
                    } else if (placeholderEl.nextSibling) {
                        placeholderEl.style.marginRight = '0px'
                    }
                } else {
                    placeholderEl.style.marginLeft = '0px'
                    placeholderEl.style.marginRight = '0px'

                    if (!placeholderEl.previousSibling) {
                        placeholderEl.style.marginTop = '0px'

                        if (placeholderEl.nextSibling) {
                            placeholderEl.style.marginRight = '0px'
                            placeholderEl.style.marginBottom = '8px'
                        }
                    } else if (placeholderEl.nextSibling) {
                        placeholderEl.style.marginBottom = '0px'
                    }
                }
            },
            onDrag({ clientX, clientY })
            {
                if (!this.draggable || this.targetEl !== window.targetEl) return

                const startX = clientX - this.mousePosInElX
                const startY = clientY - this.mousePosInElY

                const $layoutEl = this.getUnderlyingLayoutEl(startX, startY)

                switch (this.$parent.$options.name) {
                    case 'Layout':
                        if (!$layoutEl ||
                            extractCellId($layoutEl.parentNode.id) !== 0) {
                            return
                        }
                        break
                    case 'Btn':
                        if (!$layoutEl ||
                            extractCellId($layoutEl.parentNode.id) === 0 ||
                            getChildren($layoutEl).length >= 5) {
                            return
                        }
                }

                this.setLayoutComponent($layoutEl)
                this.emphasizeCurrentLayout()

                this.appendPlaceholderToDOM(
                    this.getSiblingsFromLayout(),
                    startX,
                    startY
                )
            },
            onDragEnd()
            {
                if (!this.draggable || !window.isDragging) return true

                window.isDragging = false

                let { parentLayoutComponent, lastLayoutComponent } = this,
                    { targetEl, lastLayoutEl, prevParentId } = this,

                    PLACEHOLDER = 'Layout_Cell--placeholder',

                    newPrevParentLayoutJson,
                    newNextParentLayoutJson

                if (!targetEl || !targetEl.parentElement) return true

                moveCellToPlaceholderPosition(
                    targetEl.id,
                    lastLayoutEl,
                    targetEl.parentElement
                )

                try {
                    ;({
                        newPrevParentLayoutJson,
                        newNextParentLayoutJson
                    } = moveElementToNewPosition(
                        targetEl.__vue__.$parent.getConfig(),
                        parentLayoutComponent.config,
                        lastLayoutComponent.config,
                        extractCellId(targetEl.id),
                        getParentId(targetEl),
                        prevParentId,
                        getPrevSiblingId(targetEl)
                    ))
                } catch (e) {
                }

                if (newPrevParentLayoutJson) {
                    this.parentLayoutComponent.configUpdate(newPrevParentLayoutJson)
                }
                if (newNextParentLayoutJson) {
                    this.lastLayoutComponent.configUpdate(newNextParentLayoutJson)
                }

                document.querySelectorAll(`.${PLACEHOLDER}`)
                    .forEach(el => el.remove())

                if (targetEl) targetEl.style.display = 'block'

                this.$bus.$emit('global:dragend')

                return false
            }
        },
        created()
        {
            this.parentLayoutComponent = this.$parent.$parent.$parent

            this.$on('internal:dragstart', this.onDragStart)

            if (typeof document !== 'undefined' && this.isFirefox) {
                // eslint-disable-next-line nuxt/no-globals-in-created
                document.addEventListener('dragover', e => {
                    this.onDrag(e)
                })

                this.$on('internal:dragend', () => {
                    this.$nextTick(() => {
                        this.onDragEnd()
                    })
                })
            } else {
                this.$on('internal:dragend', this.onDragEnd.bind(this))
                this.$on('internal:drag', this.onDrag)
            }

            this.$bus.$on('global:dragend', () => {
                this.hovered = false
            })
        }
    }
</script>

<style lang="scss" scoped>
    .Layout_Cell,
    .Layout_Cell--placeholder {
        box-sizing: border-box;
        position: relative;
        flex-basis: 0;
        flex-grow: 1;

        border-radius: 3px;
    }
    .Layout_Cell--hovered {
        background: #03a696;
        cursor: grab;
        opacity: .4;
    }
    .Layout_Cell--dragging {
        padding: 10px;
        border: 1px solid #e3e3e3;
        animation: pop-in 0.2s cubic-bezier(.075, .82, .165, 1) 0s 1;
    }
    .Layout_Cell--dropped {
        padding: 0;
        animation: pop-out .2s cubic-bezier(.075, .82, .165, 1) 0s 1;
    }
    .Layout_Cell--emphasized {
        border-color: #aaaaaa;
    }
    .Layout_Cell--placeholder {
        min-height: 40px;

        background: #03a696;
        color: #fff;
        opacity: 1;
    }
    .Layout--horizontal > .Layout_Cell--placeholder {
        animation: grow-right .2s linear 0s 1;
    }
    .Layout--vertical > .Layout_Cell--placeholder {
        animation: grow-down .2s linear 0s 1;
        transition: height .2s linear;
    }
    .Layout_Cell__actions {
        position: absolute;
        display: flex;
        width: 100%;

        justify-content: flex-end;
        z-index: 1;
    }
    .Layout_Cell__actions span {
        position: relative;
        display: block;

        margin: 2px 5px;
        cursor: pointer;

        .v-icon.v-icon--dense {
            font-size: 16px;
        }
    }
    .Layout_Cell__edit,
    .Layout_Cell__delete {
        color: #909090;

        .v-icon {
            font-size: 16px;
        }
    }
    @keyframes pop-in {
        0% {
            padding: 0;
        }
        25% {
            padding: 3px;
        }
        50% {
            padding: 6px;
        }
        100% {
            padding: 10px;
        }
    }
    @keyframes pop-out {
        0% {
            padding: 10px;
        }
        25% {
            padding: 6px;
        }
        50% {
            padding: 3px;
        }
        100% {
            padding: 0;
        }
    }
    @keyframes grow-right {
        0% {
            flex-grow: 0;
            opacity: 0;
        }
        60% {
            flex-grow: 1;
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    @keyframes grow-down {
        0% {
            opacity: 0;
        }
        90% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
</style>
