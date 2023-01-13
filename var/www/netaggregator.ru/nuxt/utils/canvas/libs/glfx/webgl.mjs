/** Constants taken from goog.webgl */

/**
* @const
* @type {number}
*/
export const ARRAY_BUFFER = 0x8892

/**
* @const
* @type {number}
*/
export const ELEMENT_ARRAY_BUFFER = 0x8893

/**
* @const
* @type {number}
*/
export const STREAM_DRAW = 0x88E0

/**
* @const
* @type {number}
*/
export const STATIC_DRAW = 0x88E4

/**
* @const
* @type {number}
*/
export const DYNAMIC_DRAW = 0x88E8

/**
* @const
* @type {number}
*/
export const UNSIGNED_BYTE = 0x1401

/**
* @const
* @type {number}
*/
export const UNSIGNED_SHORT = 0x1403

/**
* @const
* @type {number}
*/
export const UNSIGNED_INT = 0x1405

/**
* @const
* @type {number}
*/
export const FLOAT = 0x1406

/**
* @const
* @type {Array<string>}
*/
const CONTEXT_IDS = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']

/**
* @type {Array<string>}
*/
let supportedExtensions

/**
* @param {HTMLCanvasElement} canvas
* @param {Object=} options
* @return {WebGLRenderingContext} WebGL rendering context
*/
export function getContext(canvas, options)
{
    const ln = CONTEXT_IDS.length

    for (let i = 0; i < ln; ++i) {
        try {
            const context = canvas.getContext(CONTEXT_IDS[i], options)
            if (context) {
                return context
            }
        } catch (e) {
        }
    }

    return null
}

/**
* @return {Array<string>} List of supported WebGL extensions
*/
export function getSupportedExtensions()
{
    if (!supportedExtensions) {
        const canvas = document.createElement('canvas'),
            gl = getContext(canvas)

        if (gl) {
            supportedExtensions = gl.getSupportedExtensions()
        }
    }

    return supportedExtensions
}

/**
* @param {any} ctx
* @return {boolean}
*/
export function isWebGLRenderingContext(ctx)
{
    return ctx instanceof WebGLRenderingContext
}
