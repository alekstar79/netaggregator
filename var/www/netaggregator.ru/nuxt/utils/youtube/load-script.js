function setAttributes(script, attrs)
{
    for (const attr in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, attr)) {
            script.setAttribute(attr, attrs[attr])
        }
    }
}

function stdOnEnd(script, cb)
{
    script.onload = function() {
        this.onerror = this.onload = null
        cb(null, script)
    }

    script.onerror = function() {
        this.onerror = this.onload = null
        cb(new Error('Failed to load ' + this.src), script)
    }
}

function ieOnEnd(script, cb)
{
    script.onreadystatechange = function() {
        if (this.readyState !== 'complete' && this.readyState !== 'loaded') return
        this.onreadystatechange = null
        cb(null, script)
    }
}

function noop() {}

/**
* @see https://github.com/eldargab/load-script/blob/master/index.js
*/
export default function(src, opts, cb)
{
    const head = document.head || document.getElementsByTagName('head')[0]
    const script = document.createElement('script')

    if (typeof opts === 'function') {
        cb = opts
        opts = {}
    }

    opts = opts || {}
    cb = cb || noop

    script.type = opts.type || 'text/javascript'
    script.async = 'async' in opts ? !!opts.async : true
    script.src = src

    if (opts.attrs) {
        setAttributes(script, opts.attrs)
    }
    if (opts.text) {
        script.text = '' + opts.text
    }

    const onend = 'onload' in script ? stdOnEnd : ieOnEnd
    onend(script, cb)

    // some good legacy browsers (firefox) fail the 'in' detection above
    // so as a fallback we always set onload
    // old IE will ignore this and new IE will set onload
    if (!script.onload) {
        stdOnEnd(script, cb)
    }

    head.appendChild(script)
}
