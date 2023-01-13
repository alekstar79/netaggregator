import { kebabCase, trim } from 'lodash/string'
import goTo from 'vuetify/lib/services/goto'
import Router from 'vue-router'
import Vue from 'vue'

import paths from './routes'

Vue.use(Router)

function route({ path, name, view, component })
{
    component || (component = () => import(/* webpackMode: "lazy" */ `~/views/${view}`).then(m => m.default))

    return {
        name: name || view,
        component,
        path
    }
}

function convert({ path, name, component })
{
    if (!/:\w*\??/.test(path)) {
        path = '/' + kebabCase(trim(path, '/'))
    }

    return { path, name, component }
}

function fixRoutes(routes)
{
    return routes.map(route => convert(route)).concat(paths.map(path => route(path)))
}

function scrollBehavior(to, from, savedPosition)
{
    let scrollTo = 0

    if (to.hash) {
        scrollTo = to.hash
    } else if (savedPosition) {
        scrollTo = savedPosition.y
    }

    return goTo(scrollTo)
}

export function createRouter(ctx, createDefaultRouter, routerOptions)
{
    const options = routerOptions || createDefaultRouter(ctx).options

    return new Router({
        ...options,

        routes: fixRoutes(options.routes),
        fallback: false,

        scrollBehavior
    })
}
