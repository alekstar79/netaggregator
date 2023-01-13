// noinspection JSPotentiallyInvalidUsageOfThis,DuplicatedCode,JSUnusedGlobalSymbols

/**
* EasyQRCodeJS-NodeJS [NodeJS QRCode generator]
* Can save image or svg to file, get standard base64 image data url text or get SVG serialized text.
* Support Dot style, Logo, Background image, Colorful, Title etc.
* Support binary(hex) mode
* (Running without DOM on server side)
* Version 4.3.2
*
* @author <inthinkcolor@gmail.com>
* @see https://github.com/ushelp/EasyQRCodeJS-NodeJS
* @see http://www.easyproject.cn/easyqrcodejs/tryit.html
* @see https://github.com/ushelp/EasyQRCodeJS
*
* Copyright 2017 Ray, EasyProject
* Released under the MIT license
*/

// import C2S from './canvas2svg.mjs'
import * as util from './qr-utils.mjs'
import * as qr from './qr-model.mjs'

import clone from 'lodash/cloneDeep.js'
import merge from 'lodash/merge.js'

export default function({ /* window: win, */ nodeCanvas: Canvas }) {
    const // hasOwn = Object.prototype.hasOwnProperty,
        { _getTypeNumber, getFontDeclaration } = util,
        { QrModel, QRErrorCorrectLevel } = qr

    /**
     * Drawing QRCode by using canvas
     * @constructor
     * @param {Object} htOption QRCode Options
     */
    const Drawing = function(htOption) {
        this._canvas = Canvas.createCanvas(200, 200)
        this._htOption = htOption
        this._bIsPainted = false

        if (this._htOption._drawer === 'svg') {
            this._oContext = {}
        } else {
            this._oContext = this._canvas.getContext('2d')
        }

        this.dataURL = null
    }

    /**
     * Draw the QRCode
     * @param {QrModel} oQRCode
     */
    Drawing.prototype.draw = async function(oQRCode) {
        const _htOption = clone(this._htOption),
            _oContext = this._oContext,
            t = this

        if (_htOption.title.text) {
            _htOption.title.height = 1.2 * _htOption.title.fontSize
            _htOption.title.top = _htOption.title.height / 1.3
            _htOption.height += _htOption.title.height

        } else {
            _htOption.title.height = 0
        }

        let nCount = oQRCode.getModuleCount(),
            nWidth = Math.round(_htOption.width / nCount),
            nHeight = Math.round((_htOption.height - _htOption.title.height) / nCount)

        if (nWidth <= 1) {
            nWidth = 1
        }
        if (nHeight <= 1) {
            nHeight = 1
        }

        _htOption.width = nWidth * nCount
        _htOption.height = nHeight * nCount + _htOption.title.height
        _htOption.quietZone = Math.round(_htOption.quietZone)

        t._canvas.height = _htOption.height + _htOption.quietZone * 2
        t._canvas.width = _htOption.width + _htOption.quietZone * 2

        /* if (t._htOption._drawer === 'svg') {
            t._oContext = new C2S({
                document: win.document,
                XMLSerializer: win.XMLSerializer,
                height: t._canvas.height,
                width: t._canvas.width
            })
        } */

        t._oContext.patternQuality = 'best'  // fast | good | best | nearest | bilinear
        t._oContext.quality = 'best'         // fast | good | best | nearest |bilinear
        t._oContext.textDrawingMode = 'path' // path | glyph
        t._oContext.antialias = 'gray'       // default | none | gray | subpixel

        if (_htOption.format === 'JPG') {
            _htOption.logoBackgroundTransparent = false

            if (_htOption.backgroundImage) {
                _oContext.fillStyle = _htOption.colorLight
                _oContext.fillRect(0, 0, t._canvas.width, t._canvas.height)
            } else {
                if (_htOption.quietZoneColor === 'rgba(0,0,0,0)' || _htOption.quietZoneColor === 'transparent') {
                    _htOption.quietZoneColor = '#ffffff'
                }

                _oContext.fillStyle = _htOption.colorLight
                _oContext.fillRect(0, 0, t._canvas.width, t._canvas.height)
            }
        } else {
            _oContext.lineWidth = 0
            _oContext.fillStyle = _htOption.colorLight
            _oContext.fillRect(0, 0, t._canvas.width, t._canvas.height)
        }

        function drawQuietZoneColor()
        {
            if (_htOption.quietZone > 0 && _htOption.quietZoneColor) {
                _oContext.fillStyle = _htOption.quietZoneColor
                _oContext.lineWidth = 0

                _oContext.fillRect(0, 0, t._canvas.width, _htOption.quietZone) // top
                _oContext.fillRect(0, _htOption.quietZone, _htOption.quietZone, t._canvas.height - _htOption.quietZone * 2) // left
                _oContext.fillRect(t._canvas.width - _htOption.quietZone, _htOption.quietZone, _htOption.quietZone, t._canvas.height - _htOption.quietZone * 2) // right
                _oContext.fillRect(0, t._canvas.height - _htOption.quietZone, t._canvas.width, _htOption.quietZone) // bottom
            }
        }

        if (_htOption.backgroundImage) {
            await (function() {
                const bgImg = new Canvas.Image()

                bgImg.src = _htOption.backgroundImage

                return new Promise((resolve, reject) => {
                    bgImg.onload = () => {
                        _oContext.globalAlpha = 1
                        _oContext.globalAlpha = _htOption.backgroundImageAlpha
                        _oContext.drawImage(bgImg, 0, _htOption.title.height, _htOption.width + _htOption.quietZone * 2, _htOption.height + _htOption.quietZone * 2 - _htOption.title.height)
                        _oContext.globalAlpha = 1
                        resolve()
                    }
                    bgImg.onerror = e => {
                        reject(e)
                    }
                })
            })()
        }

        await (async function drawQrcode(oQRCode)
        {
            for (let row = 0; row < nCount; row++) {
                for (let col = 0; col < nCount; col++) {
                    let nLeft = col * nWidth + _htOption.quietZone,
                        nTop = row * nHeight + _htOption.quietZone,

                        bIsDark = oQRCode.isDark(row, col),
                        eye = oQRCode.getEye(row, col), // { isDark: true/false, type: PO_TL, PI_TL, PO_TR, PI_TR, PO_BL, PI_BL }
                        nowDotScale = _htOption.dotScale,
                        dColor,
                        lColor

                    _oContext.lineWidth = 0

                    if (eye) {
                        dColor = _htOption[eye.type] || _htOption[eye.type.substring(0, 2)] || _htOption.colorDark
                        lColor = _htOption.colorLight

                    } else if (_htOption.backgroundImage) {
                        lColor = 'rgba(0,0,0,0)'

                        if (row === 6) {
                            if (_htOption.autoColor) {
                                dColor = _htOption.timing_H || _htOption.timing || _htOption.autoColorDark
                                lColor = _htOption.timing_H || _htOption.timing || _htOption.autoColorLight
                            } else {
                                dColor = _htOption.timing_H || _htOption.timing || _htOption.colorDark
                            }
                        } else if (col === 6) {
                            if (_htOption.autoColor) {
                                dColor = _htOption.timing_V || _htOption.timing || _htOption.autoColorDark
                                lColor = _htOption.timing_V || _htOption.timing || _htOption.autoColorLight
                            } else {
                                dColor = _htOption.timing_V || _htOption.timing || _htOption.colorDark
                            }
                        } else if (_htOption.autoColor) {
                            dColor = _htOption.autoColorDark
                            lColor = _htOption.autoColorLight
                        } else {
                            dColor = _htOption.colorDark
                        }
                    } else {
                        if (row === 6) {
                            dColor = _htOption.timing_H || _htOption.timing || _htOption.colorDark
                        } else if (col === 6) {
                            dColor = _htOption.timing_V || _htOption.timing || _htOption.colorDark
                        } else {
                            dColor = _htOption.colorDark
                        }

                        lColor = _htOption.colorLight
                    }

                    _oContext.strokeStyle = bIsDark ? dColor : lColor
                    _oContext.fillStyle = bIsDark ? dColor : lColor

                    if (eye) { // Is eye
                        bIsDark = eye.isDarkBlock

                        if (eye.type === 'AO') {
                            nowDotScale = _htOption.dotScaleAO
                        } else if (eye.type === 'AI') {
                            nowDotScale = _htOption.dotScaleAI
                        } else {
                            nowDotScale = 1
                        }
                        if (_htOption.backgroundImage && _htOption.autoColor) {
                            dColor = ((eye.type === 'AO') ? _htOption.AI : _htOption.AO) || _htOption.autoColorDark
                            lColor = _htOption.autoColorLight
                        } else {
                            dColor = ((eye.type === 'AO') ? _htOption.AI : _htOption.AO) || dColor
                        }

                        _oContext.fillRect(
                            nLeft + nWidth * (1 - nowDotScale) / 2,
                            _htOption.title.height + nTop + nHeight * (1 - nowDotScale) / 2,
                            nWidth * nowDotScale, nHeight * nowDotScale
                        )
                    } else if (row === 6) {
                        nowDotScale = _htOption.dotScaleTiming_H

                        _oContext.fillRect(
                            nLeft + nWidth * (1 - nowDotScale) / 2,
                            _htOption.title.height + nTop + nHeight * (1 - nowDotScale) / 2,
                            nWidth * nowDotScale, nHeight * nowDotScale
                        )
                    } else if (col === 6) {
                        nowDotScale = _htOption.dotScaleTiming_V

                        _oContext.fillRect(
                            nLeft + nWidth * (1 - nowDotScale) / 2,
                            _htOption.title.height + nTop + nHeight * (1 - nowDotScale) / 2,
                            nWidth * nowDotScale, nHeight * nowDotScale
                        )
                    } else if (_htOption.backgroundImage) {
                        _oContext.fillRect(
                            nLeft + nWidth * (1 - nowDotScale) / 2,
                            _htOption.title.height + nTop + nHeight * (1 - nowDotScale) / 2,
                            nWidth * nowDotScale, nHeight * nowDotScale
                        )
                    } else {
                        _oContext.fillRect(
                            nLeft + nWidth * (1 - nowDotScale) / 2,
                            _htOption.title.height + nTop + nHeight * (1 - nowDotScale) / 2,
                            nWidth * nowDotScale, nHeight * nowDotScale
                        )
                    }
                    if (_htOption.dotScale !== 1 && !eye) {
                        _oContext.strokeStyle = _htOption.colorLight
                    }
                }
            }
            if (_htOption.title.text) {
                _oContext.fillStyle = _htOption.title.backgroundColor
                _oContext.fillRect(0, 0, t._canvas.width, _htOption.title.height + t._htOption.quietZone)

                _oContext.font = getFontDeclaration(_htOption.title)
                _oContext.fillStyle = _htOption.title.color
                _oContext.textAlign = 'center'
                _oContext.fillText(_htOption.title.text, t._canvas.width / 2, _htOption.quietZone + _htOption.title.top)
            }
            if (_htOption.logo) {
                try {

                    (function(img) {
                        let imgContainerH = Math.round(_htOption.height / 3.5),
                            imgContainerW = Math.round(_htOption.width / 3.5),
                            nw, nh

                        if (imgContainerW !== imgContainerH) {
                            imgContainerW = imgContainerH
                        }
                        if (_htOption.logoMaxWidth) {
                            imgContainerW = Math.round(_htOption.logoMaxWidth)
                        } else if (_htOption.logoWidth) {
                            imgContainerW = Math.round(_htOption.logoWidth)
                        }
                        if (_htOption.logoMaxHeight) {
                            imgContainerH = Math.round(_htOption.logoMaxHeight)
                        } else if (_htOption.logoHeight) {
                            imgContainerH = Math.round(_htOption.logoHeight)
                        }
                        if (typeof img.naturalWidth === 'undefined') {
                            nh = img.height
                            nw = img.width
                        } else {
                            nh = img.naturalHeight
                            nw = img.naturalWidth
                        }
                        if (_htOption.logoMaxWidth || _htOption.logoMaxHeight) {
                            if (_htOption.logoMaxWidth && nw <= imgContainerW) {
                                imgContainerW = nw
                            }
                            if (_htOption.logoMaxHeight && nh <= imgContainerH) {
                                imgContainerH = nh
                            }
                            if (nw <= imgContainerW && nh <= imgContainerH) {
                                imgContainerW = nw
                                imgContainerH = nh
                            }
                        }

                        let imgContainerX = (_htOption.width + _htOption.quietZone * 2 - imgContainerW) / 2,
                            imgContainerY = (_htOption.height + _htOption.title.height + _htOption.quietZone * 2 - imgContainerH) / 2,
                            imgScale = Math.min(imgContainerW / nw, imgContainerH / nh),
                            imgW = nw * imgScale,
                            imgH = nh * imgScale

                        if (_htOption.logoMaxWidth || _htOption.logoMaxHeight) {
                            imgContainerW = imgW
                            imgContainerH = imgH

                            imgContainerX = (_htOption.width + _htOption.quietZone * 2 - imgContainerW) / 2
                            imgContainerY = (_htOption.height + _htOption.title.height + _htOption.quietZone * 2 - imgContainerH) / 2
                        }

                        // Did not use transparent logo image
                        if (!_htOption.logoBackgroundTransparent) {
                            _oContext.fillStyle = _htOption.logoBackgroundColor
                            _oContext.fillRect(imgContainerX, imgContainerY, imgContainerW, imgContainerH)
                        }

                        _oContext.drawImage(img, imgContainerX + (imgContainerW - imgW) / 2, imgContainerY + (imgContainerH - imgH) / 2, imgW, imgH)

                        drawQuietZoneColor()
                        t._bIsPainted = true
                        t.makeImage()

                    })(await (function () {
                        return new Promise((resolve, reject) => {
                            const img = new Canvas.Image()

                            img.onload = () => {
                                resolve(img)
                            }
                            img.onerror = e => {
                                reject(e)
                            }

                            img.src = _htOption.logo
                        })
                    })())

                } catch (e) {
                    console.log(`DRAW ERROR: ${e.message}`)
                }

            } else {
                drawQuietZoneColor()
                t._bIsPainted = true
                t.makeImage()
            }

        })(oQRCode)
    }

    Drawing.prototype.makeImage = function() {
        const t = this

        if (this._htOption.onRenderingStart) {
            this._htOption.onRenderingStart(this._htOption)
        }
        if (this._htOption._drawer === 'svg') {
            t.resolve(this._oContext.getSerializedSvg())

        } else if (this._htOption.format === 'PNG') {
            this._canvas.toDataURL((err, data) => {
                !err && t.resolve && t.resolve(data)
            })
        } else {
            this._canvas.toDataURL('image/jpeg', (err, data) => {
                !err && t.resolve && t.resolve(data)
            })
        }
    }

    /**
     * Return whether the QRCode is painted or not
     * @return {Boolean}
     */
    Drawing.prototype.isPainted = function() {
        return this._bIsPainted
    }

    Drawing.prototype.clear = Drawing.prototype.remove = function() {
        this._oContext.clearRect(0, 0, this._canvas.width, this._canvas.height)
        this._bIsPainted = false
    }

    Drawing.prototype.round = function(n) {
        return n ? Math.floor(n * 1000) / 1000 : n
    }

    function QRCode(vOption)
    {
        this._htOption = {
            height: 384,
            width: 384,
            typeNumber: 4,
            colorDark: 'rgba(0,0,0,1)',
            colorLight: 'rgba(255,255,255,1)',
            correctLevel: QRErrorCorrectLevel.H,

            dotScale: 1, // For body block, must be greater than 0, less than or equal to 1. default is 1

            dotScaleTiming: 1, // Dafault for timing block , must be greater than 0, less than or equal to 1. default is 1
            dotScaleTiming_H: undefined, // For horizontal timing block, must be greater than 0, less than or equal to 1. default is 1
            dotScaleTiming_V: undefined, // For vertical timing block, must be greater than 0, less than or equal to 1. default is 1

            dotScaleA: 1, // Dafault for alignment block, must be greater than 0, less than or equal to 1. default is 1
            dotScaleAO: undefined, // For alignment outer block, must be greater than 0, less than or equal to 1. default is 1
            dotScaleAI: undefined, // For alignment inner block, must be greater than 0, less than or equal to 1. default is 1

            quietZone: 0,
            quietZoneColor: 'rgba(0,0,0,0)',

            title: {
                text: '',
                fontFamily: 'sans-serif',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: 24,
                backgroundColor: 'rgba(255,255,255,1)',
                color: 'rgba(0,0,0,1)',
                height: 0,
                top: 0
            },

            logo: undefined,
            logoWidth: undefined,
            logoHeight: undefined,
            logoMaxWidth: undefined,
            logoMaxHeight: undefined,
            logoBackgroundColor: 'rgba(255,255,255,1)',
            logoBackgroundTransparent: false,

            // === Posotion Pattern(Eye) Color
            PO: undefined, // Global Posotion Outer color. if not set, the defaut is `colorDark`
            PI: undefined, // Global Posotion Inner color. if not set, the defaut is `colorDark`
            PO_TL: undefined, // Posotion Outer - Top Left
            PI_TL: undefined, // Posotion Inner - Top Left
            PO_TR: undefined, // Posotion Outer - Top Right
            PI_TR: undefined, // Posotion Inner - Top Right
            PO_BL: undefined, // Posotion Outer - Bottom Left
            PI_BL: undefined, // Posotion Inner - Bottom Left

            // === Alignment Color
            AO: undefined, // Alignment Outer. if not set, the defaut is `colorDark`
            AI: undefined, // Alignment Inner. if not set, the defaut is `colorDark`

            // === Timing Pattern Color
            timing: undefined,   // Global Timing color. if not set, the defaut is `colorDark`
            timing_H: undefined, // Horizontal timing color
            timing_V: undefined, // Vertical timing color

            // ==== Backgroud Image
            backgroundImage: undefined, // Background Image
            backgroundImageAlpha: 1,    // Background image transparency, value between 0 and 1. default is 1.
            autoColor: false,           // Automatic color adjustment(for data block)
            autoColorDark: 'rgba(0,0,0,1)', // Automatic color: dark CSS color
            autoColorLight: 'rgba(255,255,255,1)', // Automatic: color light CSS color

            // ==== Event Handler
            onRenderingStart: undefined,

            // ==== Images format
            format: 'PNG', // PNG or JPG
            compressionLevel: 6, // ZLIB compression level (0-9). default is 6
            quality: .75, // An object specifying the quality (0 to 1). default is .75. (JPGs only)

            // ==== Versions
            qversion: 0, // The symbol versions of QR Code range from Version 1 to Version 40. default 0 means automatically choose the closest version based on the text length.

            // ==== binary(hex) data mode
            binary: false // Whether it is binary mode, default is text mode.
        }
        if (typeof vOption === 'string') {
            vOption = { text: vOption }
        }
        if (vOption) {
            this._htOption = merge(this._htOption, vOption)
        }
        if (this._htOption.qversion < 0 || this._htOption.qversion > 40) {
            this._htOption.qversion = 0
        }

        this._htOption.format = this._htOption.format.toUpperCase()

        if (this._htOption.format !== 'PNG' && this._htOption.format !== 'JPG') {
            this._htOption.format = 'PNG'
        }
        if (this._htOption.format === 'PNG' && (this._htOption.compressionLevel < 0 || this._htOption.compressionLevel > 9)) {
            this._htOption.compressionLevel = 1

        } else if (this._htOption.quality < 0 || this._htOption.quality > 1) {
            this._htOption.quality = 0.75
        }
        if (this._htOption.dotScale < 0 || this._htOption.dotScale > 1) {
            this._htOption.dotScale = 1
        }
        if (this._htOption.dotScaleTiming < 0 || this._htOption.dotScaleTiming > 1) {
            this._htOption.dotScaleTiming = 1
        }
        if (this._htOption.dotScaleTiming_H) {
            if (this._htOption.dotScaleTiming_H < 0 || this._htOption.dotScaleTiming_H > 1) {
                this._htOption.dotScaleTiming_H = 1
            }
        } else {
            this._htOption.dotScaleTiming_H = this._htOption.dotScaleTiming
        }
        if (this._htOption.dotScaleTiming_V) {
            if (this._htOption.dotScaleTiming_V < 0 || this._htOption.dotScaleTiming_V > 1) {
                this._htOption.dotScaleTiming_V = 1
            }
        } else {
            this._htOption.dotScaleTiming_V = this._htOption.dotScaleTiming
        }
        if (this._htOption.dotScaleA < 0 || this._htOption.dotScaleA > 1) {
            this._htOption.dotScaleA = 1
        }
        if (this._htOption.dotScaleAO) {
            if (this._htOption.dotScaleAO < 0 || this._htOption.dotScaleAO > 1) {
                this._htOption.dotScaleAO = 1
            }
        } else {
            this._htOption.dotScaleAO = this._htOption.dotScaleA
        }
        if (this._htOption.dotScaleAI) {
            if (this._htOption.dotScaleAI < 0 || this._htOption.dotScaleAI > 1) {
                this._htOption.dotScaleAI = 1
            }
        } else {
            this._htOption.dotScaleAI = this._htOption.dotScaleA
        }
        if (this._htOption.backgroundImageAlpha < 0 || this._htOption.backgroundImageAlpha > 1) {
            this._htOption.backgroundImageAlpha = 1
        }
        if (!this._htOption.drawer || (this._htOption.drawer !== 'svg' && this._htOption.drawer !== 'canvas')) {
            this._htOption.drawer = 'canvas'
        }

        // this._htOption.height = this._htOption.height + this._htOption.title.height
        // this._oDrawing = new Drawing(clone(this._htOption))
        /* if (this._htOption.text) {
            this.makeCode(this._htOption.text)
        } */
    }

    /**
     * Make the QRCode
     * @param {String} sText link data
     */
    QRCode.prototype.makeCode = function(sText) {
        sText || (sText = this._htOption.text)

        this._oQRCode = new QrModel(_getTypeNumber(sText, this._htOption), this._htOption.correctLevel)
        this._oQRCode.addData(sText, this._htOption.binary)
        this._oQRCode.make()

        return this
    }

    QRCode.prototype.draw = async function() {
        this._oDrawing = new Drawing(clone(this._htOption))
        await this._oDrawing.draw(this._oQRCode)
    }

    /**
     * Make the Image from Canvas element
     * @private
     */
    QRCode.prototype.makeImage = function() {
        this._oDrawing.makeImage()
    }

    QRCode.prototype._toData = function(drawer) {
        const defOptions = { makeType: 'URL' },
            t = this

        this._htOption._drawer = drawer

        const _oDrawing = new Drawing(Object.assign({}, this._htOption))
        _oDrawing.makeOptions = defOptions

        return new Promise((resolve, reject) => {
            _oDrawing.resolve = resolve
            _oDrawing.reject = reject
            _oDrawing.draw(t._oQRCode)
        })
    }

    /**
     * Get standard base64 image data url text: 'data:image/png;base64,...' or SVG data text
     */
    QRCode.prototype.toDataURL = function() {
        return this._toData('canvas')
    }

    /**
     * Get SVG data text: '<svg xmlns:xlink="http://www.w3.org/1999/xlink"...'
     */
    QRCode.prototype.toSVGText = function() {
        return this._toData('svg')
    }

    Object.defineProperties(QRCode.prototype, {
        canvas: {
            enumerable: true,

            get() {
                return this._oDrawing._canvas
            }
        },
        height: {
            enumerable: true,

            get() {
                return this._oDrawing._canvas.height
            },
            set(v) {
                this._htOption.height = v
            }
        },
        width: {
            enumerable: true,

            get() {
                return this._oDrawing._canvas.width
            },
            set(v) {
                this._htOption.width = v
            }
        },
        title: {
            enumerable: true,

            get() {
                return this._htOption.title
            },
            set(v) {
                this._htOption.title = v
            }
        },
        text: {
            enumerable: true,

            get() {
                return this._htOption.text
            },
            set(v) {
                this._htOption.text = v
            }
        },
        logo: {
            enumerable: true,

            get() {
                return this._htOption.logo
            },
            set(v) {
                this._htOption.logo = v
            }
        }
    })

    /**
     * @name QRCode.CorrectLevel
     */
    QRCode.CorrectLevel = QRErrorCorrectLevel

    return QRCode
}
