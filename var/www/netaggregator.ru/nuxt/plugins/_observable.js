import Vue from 'vue'

/**
* @see https://github.com/nuxt-community/observable-module
*/
export default async (ctx, inject) => {
    try {

        const { state } = await import('~/state')

        if (process.server) {
            ctx.$state = Vue.observable(state())
            ctx.ssrContext.nuxt.observable = ctx.$state
        } else {
            ctx.$state = Vue.observable(window.__NUXT__.observable)
        }

        inject('state', ctx.$state)

    } catch (e) {
    }
}
