// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(setFilters)

/** @see https://github.com/pixolith/fabricjs-async-web-worker-filters/tree/master/dist/filters */

export async function setFilters({ fabric })
{
    const { default: Redify } = await import('./filters/redify.mjs'),
        { util: { createClass }, Image: { filters } } = fabric

    fabric.enableGLFiltering = false
    fabric.isWebglSupported(fabric.textureSize)
    fabric.filterBackend = new fabric.Canvas2dFilterBackend()

    filters.Redify = createClass(filters.BaseFilter, Redify)
    filters.Redify.fromObject = filters.BaseFilter.fromObject

    return fabric
}
