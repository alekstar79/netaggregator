const options = ['hasControls', 'hasBorders', 'selectable', 'evented']

function set(value)
{
    const props = options.reduce((a, p) => ({ ...a, [p]: value }), {})

    props.lockMovementX = !value
    props.lockMovementY = !value

    return props
}

export function unlock(canvas)
{
    const props = set(true)

    canvas.forEachObject(o => { o.set(props) })
}

export function lock(canvas)
{
    const props = set(false)

    canvas.forEachObject(o => { o.set(props) })
}
