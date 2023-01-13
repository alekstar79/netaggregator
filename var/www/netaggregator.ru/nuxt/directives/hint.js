let switcher, observer, hints = new Map()

function createObserver(callback)
{
    observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                callback(mutation)
            }
        }
    })
}

function handler({ removedNodes, target })
{
    if (!removedNodes.length || !hints.has(target)) return

    const { el, where } = hints.get(target)

    target.insertAdjacentElement(where, el)
}

function hide()
{
    hints.forEach(({ el }) => el.style.display = 'none')
}

function show()
{
    hints.forEach(({ el }) => el.style.removeProperty('display'))
}

function createSwitcher()
{
    this.$bus.$on('hints:toggle', v => v ? show() : hide())
}

function createHint(el, where, { value /* position */ })
{
    const pulse = document.createElement('div'),
        dot = document.createElement('div'),
        a = document.createElement('a')

    pulse.classList.add('introjs-hint-pulse')
    dot.classList.add('introjs-hint-dot')

    a.setAttribute('aria-label', 'hint')
    a.classList.add('introjs-hint')

    // a.style.left = `${position.left}px`
    // a.style.top = `${position.top}px`

    a.setAttribute('role', 'button')
    a.setAttribute('tabindex', '0')

    a.appendChild(dot)
    a.appendChild(pulse)

    a.onclick = () => {
        this.$bus.$emit('show:hint', value)
    }

    el.insertAdjacentElement(where, a)

    if (!this.$store.state.app.hints) {
        a.style.display = 'none'
    }

    return a
}

/**
* @type {{DirectiveOptions}}
*/
export const hint = {
    inserted(el, { arg: margin = 10, modifiers, value = {} }, { context })
    {
        if (hints.has(el)) return

        let { /* left, top, */ width, height } = el.getBoundingClientRect(),
            position = { left: 0, top: (height / 2) - 7 },
            where = 'afterbegin'

        switch (true) {
            case modifiers.right:
                position.left = width + margin
                where = 'beforeend'
                break
            case modifiers.left:
                position.left = -margin
                break
        }

        hints.set(el, {
            el: createHint.call(context._self, el, where, { value /* position */ }),
            where
        })

        observer || createObserver(handler)
        observer.observe(el, { childList: true })
    },
    bind(el, bindings, { context })
    {
        switcher || createSwitcher.call(context._self)
    }
}
