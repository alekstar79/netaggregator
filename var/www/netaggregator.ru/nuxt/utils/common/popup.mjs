export function popup({ url, height, width, target = 'auth', left = null, top = null })
{
    let options

    if (left === null || top === null) {
        let outerHeight = window.outerHeight || (document.body.clientHeight - 22),
            outerWidth = window.outerWidth || document.body.clientWidth,

            screenX = window.screenX || window.screenLeft,
            screenY = window.screenY || window.screenTop

        top = Math.round(screenY + ((outerHeight - height) / 2.5))
        left = Math.round(screenX + ((outerWidth - width) / 2))
    }

    options = `width=${width},height=${height},left=${left},top=${top}`

    return window.open(url, target, options)
}
