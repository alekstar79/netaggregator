import { WowListener, getAnimationName } from '~/utils/wow-listener'

const wowListener = new WowListener()

// function noop() {}
function bind(el, binding)
{
    const config = binding.value || {}

    // Note: "data-wow-animation" is not parameter from WOW.js (It was implement only to adapt for this interface)
    if (!('animation-name' in config)) {
        config['animation-name'] = getAnimationName(el) // el.style['animation-name']
    }
    if (!('animation-delay' in config) && el.hasAttribute('data-wow-delay')) {
        config['animation-delay'] = el.getAttribute('data-wow-delay')
    }
    if (!('animation-duration' in config) && el.hasAttribute('data-wow-duration')) {
        config['animation-duration'] = el.getAttribute('data-wow-duration')
    }

    // Class form Animate.css (this should be an options)
    el.classList.add('animated')
    el.style.visibility = 'hidden'
    el.style['animation-name'] = 'none'

    wowListener.register(el, config)
}

/**
* @see https://github.com/guisoares2011/vue-wow
*/
export const wow = {
    bind
}
