// https://stackoverflow.com/questions/6132796/how-to-make-a-jsonp-request-from-javascript-without-jquery

export const callback = 'jQuery'

export function jsonp(src, options = {})
{
    return new Promise((resolve, reject) => {
        const script = document.createElement('script'),
            timeout = options?.timeout || 7 // sec

        const trigger = window.setTimeout(() => {
            window[callback] = function() {}
            script.remove()
            reject()
        }, timeout * 1000)

        window[callback] = data => {
            window.clearTimeout(trigger)
            script.remove()
            resolve(data)
        }

        script.type = 'text/javascript'
        script.async = true
        script.src = src

        document.getElementsByTagName('head')[0]
            .appendChild(script)
    })
}
