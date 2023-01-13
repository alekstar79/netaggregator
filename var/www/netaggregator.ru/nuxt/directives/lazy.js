import Lazy from 'vue-lazyload/src/lazy'
import Vue from 'vue'

const LazyClass = Lazy(Vue)
const lazy = new LazyClass({
    listenEvents: ['scroll','wheel','mousewheel'],
    lazyComponent: true,
    dispatchEvent: true,
    observer: true
})

/**
* Used in the chatbot/VScroller component
* @ref jetbrains://php-storm/navigate/reference?project=cloudvps.loc&fqn=default.directives.lazy
*/
export default {
    bind: lazy.add.bind(lazy),
    update: lazy.update.bind(lazy),
    componentUpdated: lazy.lazyLoadHandler.bind(lazy),
    unbind: lazy.remove.bind(lazy)
}
