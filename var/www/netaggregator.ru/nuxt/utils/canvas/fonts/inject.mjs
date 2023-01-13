/**
* @see https://stackoverflow.com/a/35926947
* @example const fontlist = [
*   { file: 'CustomFontRegular.tff', family: 'Custom Font Regular' },
*   { file: 'CustomFontItalic.tff', family: 'Custom Font Italic' }
* ]
*
* font.injectAll(fontlist)
*/
export const fonts = {
    stylesheet: null,
    path: null,

    injectAll(fonts)
    {
        if (this.stylesheet === null) {
            this.stylesheet = this.generateStyleSheet()
        }

        fonts.forEach(this.insertFont.bind(this))
    },

    insertFont(font)
    {
        const rule = this.getFontRule(font)

        this.stylesheet.insertRule(rule, 0)
    },

    getFontRule({ family, file })
    {
        return '@font-face { font-family: "' + family + `"; src: url(${this.path}'` + file + '); }'
    },

    generateStyleSheet()
    {
        const style = document.createElement('style')

        style.appendChild(document.createTextNode('')) // webkit hack
        document.head.appendChild(style)

        return style.sheet
    }
}
