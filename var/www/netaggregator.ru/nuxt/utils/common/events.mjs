export function removeEvents(events)
{
    Object.keys(events).forEach(e => { document.removeEventListener(e, events[e]) })
}

export function addEvents(events)
{
    Object.keys(events).forEach(e => { document.addEventListener(e, events[e]) })
}
