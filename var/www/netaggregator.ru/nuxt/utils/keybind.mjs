// const name2html = { Tab: '\u21E5', Enter: '\u23CE', Escape: '\u238B' }

const name2code = {
    A: 65, b: 66, C: 67, D: 68, E: 69, F: 70, g: 71,
    H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78,
    O: 79, P: 80, Q: 81, r: 82, S: 83, T: 84, U: 85,
    V: 86, W: 87, X: 88, Y: 89, Z: 90,

    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    Pause: 19,
    CapsLock: 20,
    Escape: 27,
    Space: 32,
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    Insert: 45,
    Delete: 46,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,

    F1:  112,
    F2:  113,
    F3:  114,
    F4:  115,
    F5:  116,
    F6:  117,
    F7:  118,
    F8:  119,
    F9:  120,
    F10: 121,
    F11: 122,
    F12: 123
}

/* const code2name = (function() {
    const d = {}

    for (let name in name2code) {
        d[name2code[name]] = name
    }

    return d
})() */

class PhysicalKey
{
    constructor(keyCode)
    {
        this.keyCode = keyCode
    }

    static fromEvent({ keyCode })
    {
        return new PhysicalKey(keyCode)
    }

    static fromString(s)
    {
        let S = s.toUpperCase(),
            keyCode = null

        if (s.length === 1) {
            return new PhysicalKey(s.toUpperCase().charCodeAt(0))
        }

        Object.keys(name2code).some(k => {
            if (k === s || k === S) {
                keyCode = name2code[s] || name2code[S]
                return true
            }

            return false
        })

        if (keyCode) {
            return new PhysicalKey(keyCode)
        }

        throw new Error(`Unknown key name: ${s}`)
    }

    equals({ keyCode })
    {
        return this.keyCode === keyCode
    }

    /* toString()
    {
        const name = code2name[this.keyCode],
            html = name2html[name]

        return html || name || String.fromCharCode(this.keyCode)
    } */
}

class KeyCombination
{
    static fns = ['alt','shift','ctrl','meta']

    constructor(source)
    {
        const keys = source.split('+').map(k => k.trim())

        this.shift = false
        this.ctrl  = false
        this.meta  = false
        this.alt   = false

        KeyCombination.fns.forEach(k => {
            const i = keys.indexOf(k)

            if (i >= 0) {
                keys.splice(i, 1)
                this[k] = true
            }
        })

        if (keys.length !== 1) {
            throw new Error(`Invalid keybind source: ${source}`)
        }

        this.key = PhysicalKey.fromString(keys[0])
    }

    match(e)
    {
        return !KeyCombination.fns.some(k => this[k] !== e[`${k}Key`]) &&
            this.key.equals(PhysicalKey.fromEvent(e))
    }
}

class Keybind
{
    constructor(kc, handler)
    {
        this.combination = kc
        this.handler = handler
    }
}

function removeListener(handler, options)
{
    window && window.removeEventListener('keydown', handler, options)
}

function addListener(handler, options)
{
    window && window.addEventListener('keydown', handler, options)
}

export class Bindings
{
    static self = null

    static get instance()
    {
        Bindings.self || (Bindings.self = new Bindings())

        return Bindings.self
    }

    constructor()
    {
        ['handler','untrack','track','unbind','bind','dispose'].forEach(f => {
            this[f] = this[f].bind(this)
        })

        this.keybinds = new Set()
        this.enable = false
    }

    handler(e)
    {
        if (e.repeat) return

        for (const kb of this.keybinds) {
            if (!kb.combination.match(e)) continue

            e.stopImmediatePropagation()
            e.preventDefault()

            kb.handler(e)

            break
        }
    }

    on(source, handler)
    {
        const kb = new Keybind(new KeyCombination(source), handler)

        this.keybinds.add(kb)

        return kb
    }

    bind(source)
    {
        return source.map(b => this.on(b.keys, b.handler))
    }

    unbind(map)
    {
        map.forEach(kb => this.keybinds.delete(kb))
    }

    dispose()
    {
        this.keybinds.clear()
    }

    track()
    {
        if (!this.enable) {
            addListener(this.handler)
            this.enable = true
        }
    }

    untrack()
    {
        removeListener(this.handler)
        this.enable = false
    }
}
