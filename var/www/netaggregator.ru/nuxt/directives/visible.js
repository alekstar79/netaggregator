import { requestIdleCallback } from '~/utils/callbacks.mjs'

import 'intersection-observer'

const instances = new WeakMap()
const taskList = []

let taskHandle = 0

function run(deadline)
{
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && taskList.length) {
        const task = taskList.shift()

        task.handler(task.data)
    }

    if (taskList.length) {
        taskHandle = requestIdleCallback(run, { timeout: 1e3 })
    } else {
        taskHandle = 0
    }
}

function enqueue(handler, data)
{
    taskList.push({ handler, data })

    if (!taskHandle) {
        taskHandle = requestIdleCallback(run, { timeout: 1e3 })
    }
}

function disconnect(observer)
{
    if (observer) {
        observer.disconnect()
    }
}

function unbind(el)
{
    if (instances.has(el)) {
        const { observer } = instances.get(el)

        disconnect(observer)
        instances.delete(el)
    }
}

/**
* @see https://developer.mozilla.org/ru/docs/Web/API/Intersection_Observer_API
*/
function bind(el, { value, modifiers, arg }, vnode)
{
    unbind(el)

    let root, margin = arg, handler = value, isIntersect = true

    if (typeof value === 'object') {
        isIntersect = 'intersect' in value ? value.intersect : true
        margin || (margin = value.rootMargin)
        handler = value.handler
        root = value.root
    }
    if (typeof handler === 'function') {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(({ isIntersecting, target }) => {
                if (isIntersect && !isIntersecting) return

                enqueue(handler, { el: target, vnode, isIntersecting })

                if (modifiers.once) {
                    unbind(el)
                }
            })

        }, {
            threshold: 0,
            rootMargin: margin ? `${margin}px ${margin}px ${margin}px ${margin}px` : '0px',
            root
        })

        instances.set(el, { observer })
        observer.observe(el)
    }
}

function update(el, { value, oldValue, modifiers, arg }, vnode)
{
    if (value !== oldValue) {
        bind(el, { value, modifiers, arg }, vnode)
    }
}

export default {
    update,
    unbind,
    bind
}
