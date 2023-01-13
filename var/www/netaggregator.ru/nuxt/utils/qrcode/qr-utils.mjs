// import { detectUserAgent } from '../common/user-agent.mjs'
import * as qr from './qr-model.mjs'

const navigator = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' ? window.navigator : { userAgent: '' },
    { QRErrorCorrectLevel, QRCodeLimitLength } = qr

function _getUTF8Length(sText)
{
    const replacedText = encodeURI(sText).toString().replace(/%[0-9a-fA-F]{2}/g, 'a')

    return replacedText.length + (replacedText.length !== sText.length ? 3 : 0)
}

/**
 * Get the type by string length
 * @private
 * @param {String} sText
 * @param {Object} _htOption
 * @return {Number} type
 */
export function _getTypeNumber(sText, _htOption)
{
    let nCorrectLevel = _htOption.correctLevel,
        length = _getUTF8Length(sText),
        nLimit = 0,
        nType = 1

    for (let i = 0, len = QRCodeLimitLength.length; i < len; i++) {
        nLimit = 0

        switch (nCorrectLevel) {
            case QRErrorCorrectLevel.L:
                nLimit = QRCodeLimitLength[i][0]
                break
            case QRErrorCorrectLevel.M:
                nLimit = QRCodeLimitLength[i][1]
                break
            case QRErrorCorrectLevel.Q:
                nLimit = QRCodeLimitLength[i][2]
                break
            case QRErrorCorrectLevel.H:
                nLimit = QRCodeLimitLength[i][3]
                break
        }

        if (length <= nLimit) {
            break
        } else {
            nType++
        }
    }

    if (nType > QRCodeLimitLength.length) {
        throw new Error('Too long data. the CorrectLevel.' + ['M', 'L', 'H', 'Q'][nCorrectLevel] + ' limit length is ' + nLimit)
    }
    if (_htOption.qversion !== 0) {
        if (nType <= _htOption.qversion) {
            nType = _htOption.qversion
        }

        _htOption.runVersion = nType
    }

    return nType
}

// android 2.x doesn't support DataURI spec.
export function _getAndroid()
{
    let sAgent = navigator.userAgent,
        android = false

    if (/android/i.test(sAgent)) { // android
        android = true

        let aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i)

        if (aMat && aMat[1]) {
            android = parseFloat(aMat[1])
        }
    }

    return android
}

export function getFontDeclaration(options)
{
    const { fontWeight = 500, fontStyle = 'normal', fontSize = 24, fontFamily = 'sans-serif' } = options,
        isLikelyNode = typeof window === 'undefined'

    return [
        (isLikelyNode ? fontWeight : fontStyle),
        (isLikelyNode ? fontStyle : fontWeight),
        fontSize + 'px',
        (isLikelyNode ? ('"' + fontFamily + '"') : fontFamily)
    ].join(' ')
}
