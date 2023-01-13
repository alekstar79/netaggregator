import throttle from 'lodash/throttle'

/**
* for pdf component
* not used in the project
*/
export default {
    inserted(el, { value: callback, modifiers })
    {
        el.addEventListener('scroll', throttle(callback, 300), true)

        if (modifiers.immediate) {
            callback()
        }
    }
}
