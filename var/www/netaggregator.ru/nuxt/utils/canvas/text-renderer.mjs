import { rndstring } from '../common/symbols.mjs'

export const textBaselineTypes = { ALPHABETIC: 'alphabetic', BOTTOM: 'bottom', HANGING: 'hanging', MIDDLE: 'middle', TOP: 'top' }
export const textAlignTypes = { CENTER: 'center', END: 'end', LEFT: 'left', RIGHT: 'right', START: 'start' }
export const drawTypes = { FILL: 'fill', STROKE: 'stroke' }
export const lineHeight = 1.16

export function splitText(ctx, text, maxWidth)
{
    let words = text.split(' '),
        lines = [],
        line = ''

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '

        if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(line)
            line = words[n] + ' '

        } else {
            line = testLine
        }
    }

    lines.push(line)

    return lines
}

export function wrapText(ctx, text, marginLeft, marginTop, maxWidth, fontSize, lineHeight)
{
    let words = text.split(' '),
        line = ''

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '

        if (ctx.measureText(testLine).width > maxWidth) {
            ctx.fillText(line, marginLeft, marginTop)
            line = words[n] + ' '
            marginTop += lineHeight * fontSize

        } else {
            line = testLine
        }
    }

    ctx.fillText(line, marginLeft, marginTop)
}

/**
* @see https://coderoad.ru/10508988/html-canvas-%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE%D1%82%D0%BE%D1%87%D0%B8%D0%B5-%D0%BF%D0%B5%D1%80%D0%B5%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F-%D1%82%D0%B5%D0%BA%D1%81%D1%82%D0%B0#10511598
*/
export function truncateText(ctx, str, maxWidth)
{
    let width = ctx.measureText(str).width,
        len = str.length,
        ellipsis = '…'

    let ellipsisWidth = ctx.measureText(ellipsis).width

    if (width > maxWidth) {
        while (width >= maxWidth - ellipsisWidth && len-- > 0) {
            str = str.substring(0, len)
            width = ctx.measureText(str).width
        }

        return str + ellipsis
    }

    return str
}

export class TextRenderer
{
    constructor(context)
    {
        const { ctx, w, h, /* color */ } = context

        this.createRenderNode = this.createRenderNode.bind(this)
        this.removeRenderNode = this.removeRenderNode.bind(this)
        this.setRenderNode = this.setRenderNode.bind(this)
        this.drawText = this.drawText.bind(this)

        this.drawType = drawTypes.FILL
        this.mark = rndstring()

        this.setRenderNode(ctx, { w, h })

        this.ctx = ctx
    }

    setRenderNode(ctx, { w, h } = {})
    {
        this.elem = document.querySelector(`.canvas-text-renderer-${this.mark}`)

        this.elem || this.createRenderNode()

        this.setNodeSizes({
            height: h || ctx.canvas.height,
            width: w || ctx.canvas.width
        })

        this.elem.innerHTML = ''
    }

    createRenderNode()
    {
        this.elem = document.createElement('div')
        this.elem.classList.add(`canvas-text-renderer-${this.mark}`)

        document.body.append(this.elem)
    }

    removeRenderNode()
    {
        document.querySelectorAll(`.canvas-text-renderer-${this.mark}`).forEach(el => el.remove())
    }

    setTextBaseline({ baseline = textBaselineTypes.ALPHABETIC })
    {
        this.ctx.textBaseline = baseline
    }

    setTextAlign({ align = textAlignTypes.CENTER })
    {
        this.ctx.textAlign = align
    }

    setFont({ fontStyle })
    {
        this.ctx.font = fontStyle
    }

    setTextStyles(options)
    {
        // this.setTextBaseline(options)
        // this.setTextAlign(options)
        this.setFont(options)
    }

    setComputedSyles()
    {
        const style = window.getComputedStyle(this.elem)
        const font = prop => style.getPropertyValue('font-' + prop)

        this.ctx.font = font('weight') + ' ' + font('size') + ' ' + font('family')
        this.ctx.textAlign = style.getPropertyValue('text-align')
        this.ctx.textBaseline = 'bottom'
    }

    /**
     * @param fontFamily
     * @param fontSize
     * @param align center|justify|left|right|start|end
     * @param baseline bottom|middle|sub|super|text-bottom|text-top|top
     * @param padding
     */
    setNodeStyles({ fontFamily, fontSize, align, baseline, padding })
    {
        Object.assign(this.elem.style, {
            lineHeight: `${lineHeight * fontSize}px`,
            fontSize: `${fontSize}px`,
            padding: `0 ${padding}px`,
            verticalAlign: baseline,
            textAlign: align,
            fontFamily
        })
    }

    setNodeSizes({ height, width })
    {
        Object.assign(this.elem.style, { height: `${height}px`, width: `${width}px` })
    }

    wrapText(text, marginLeft, marginTop, maxWidth, fontSize)
    {
        wrapText(this.ctx, text, marginLeft, marginTop, maxWidth, fontSize, lineHeight)
    }

    getLineBreaks(node, contTop = 0, contLeft = 0)
    {
        if (!node) return []

        const range = document.createRange()
        const lines = []

        range.setStart(node, 0)

        let prevBottom = range.getBoundingClientRect().bottom
        let left = range.getBoundingClientRect().left
        let str = node.textContent
        let current = 1
        let lastFound = 0
        let bottom = 0

        while (current <= str.length) {
            range.setStart(node, current)

            if (current < str.length - 1) {
                range.setEnd(node, current + 1)
            }

            const rect = range.getBoundingClientRect()
            bottom = rect.bottom

            if (bottom > prevBottom) {
                lines.push({
                    x: left - contLeft,
                    y: prevBottom - contTop,
                    text: str.substr(lastFound, current - lastFound),
                    type: this.drawType
                })

                prevBottom = bottom
                lastFound = current
                left = rect.left
            }

            current++
        }

        lines.push({
            x: left - contLeft,
            y: bottom - contTop,
            text: str.substr(lastFound),
            type: this.drawType
        })

        return lines
    }

    getRenderedTextLinesFromElement({ vertical, fontSize })
    {
        this.elem.normalize()

        // first grab all TextNodes
        const walker = document.createTreeWalker(this.elem, NodeFilter.SHOW_TEXT)
        const nodes = []

        while (walker.nextNode()) {
            nodes.push(walker.currentNode)
        }

        // now get all their positions, with line breaks
        let { left, top, height } = this.elem.getBoundingClientRect()
        top -= vertical * (height - lineHeight * fontSize * nodes.length)

        return nodes.reduce((lines, node) => lines.concat(this.getLineBreaks(node, top, left)), [])
    }

    renderText(options, computedStyle = false)
    {
        // if you wish to have new lines marked by \n in your input
        this.elem.innerHTML = options.message.replace(/\n/g, '<br>')

        const { width } = this.ctx.canvas,
            { horizontal: h } = options

        this.setNodeStyles({ ...options, padding: (width - (width * h)) / 2 })

        computedStyle ? this.setComputedSyles() : this.setTextStyles(options)

        this.getRenderedTextLinesFromElement(options)
            .forEach(this.drawText)
    }

    drawText({ text = '', x = 0, y = 0, type = drawTypes.FILL })
    {
        x |= 0
        y |= 0

        this.ctx[`${type}Text`](text, x, y)
    }
}
