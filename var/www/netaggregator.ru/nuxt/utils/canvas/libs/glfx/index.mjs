import './polyfill.mjs'

import { getInverse, getSquareToQuad, multiply } from './matrix.mjs'
import { getContext, isWebGLRenderingContext } from './webgl.mjs'
import { SplineInterpolator } from './spline.mjs'

import * as f from './filters/index.mjs'

let options = { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: false },
    gl = null

export const Shader = (function() {
    const toString = Object.prototype.toString,

        isNumber = obj => toString.call(obj) === '[object Number]',
        isArray = obj => toString.call(obj) === '[object Array]',

        defaultVertexSource = `
            attribute vec2 vertex;
            attribute vec2 _texCoord;
            varying vec2 texCoord;
            void main() {
                texCoord = _texCoord;
                gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);
            }`,

        defaultFragmentSource = `
            uniform sampler2D texture;
            varying vec2 texCoord;
            void main() {
                gl_FragColor = texture2D(texture, texCoord);
            }`

    function compileSource(type, source)
    {
        const shader = gl.createShader(type)

        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Compile error: ' + gl.getShaderInfoLog(shader))
        }

        return shader
    }

    function Shader(vertexSource, fragmentSource)
    {
        this.vertexAttribute = null
        this.texCoordAttribute = null
        this.program = gl.createProgram()

        vertexSource = vertexSource || defaultVertexSource
        fragmentSource = fragmentSource || defaultFragmentSource
        fragmentSource = 'precision highp float;' + fragmentSource

        gl.attachShader(this.program, compileSource(gl.VERTEX_SHADER, vertexSource))
        gl.attachShader(this.program, compileSource(gl.FRAGMENT_SHADER, fragmentSource))
        gl.linkProgram(this.program)

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Link error: ' + gl.getProgramInfoLog(this.program))
        }
    }

    Shader.prototype.destroy = function() {
        gl.deleteProgram(this.program)
        this.program = null
    }

    Shader.prototype.uniforms = function(uniforms) {
        gl.useProgram(this.program)

        for (const name in uniforms) {
            if (!Object.prototype.hasOwnProperty.call(uniforms, name)) continue
            const location = gl.getUniformLocation(this.program, name)

            if (location === null) continue

            const value = uniforms[name]

            if (isArray(value)) {
                switch (value.length) {
                    case 1: gl.uniform1fv(location, new Float32Array(value)); break
                    case 2: gl.uniform2fv(location, new Float32Array(value)); break
                    case 3: gl.uniform3fv(location, new Float32Array(value)); break
                    case 4: gl.uniform4fv(location, new Float32Array(value)); break
                    case 9:  gl.uniformMatrix3fv(location, false, new Float32Array(value)); break
                    case 16: gl.uniformMatrix4fv(location, false, new Float32Array(value)); break
                    default: throw new Error(`Dont't know how to load uniform "${name}" of length ${value.length}`)
                }
            } else if (isNumber(value)) {
                gl.uniform1f(location, value)
            } else {
                throw new Error(`Attempted to set uniform "${name}" to invalid value ${(value || 'undefined').toString()}`)
            }
        }

        return this
    }

    /*
    * Textures are uniforms too but for some reason can't be specified
    * by gl.uniform1f, even though floating point numbers represent
    * the integers 0 through 7 exactly
    */
    Shader.prototype.textures = function(textures) {
        gl.useProgram(this.program)

        for (const name in textures) {
            if (!Object.prototype.hasOwnProperty.call(textures, name)) continue
            gl.uniform1i(gl.getUniformLocation(this.program, name), textures[name])
        }

        return this
    }

    Shader.prototype.drawRect = function(left, top, right, bottom) {
        const viewport = gl.getParameter(gl.VIEWPORT)

        top = top !== undefined ? (top - viewport[1]) / viewport[3] : 0
        left = left !== undefined ? (left - viewport[0]) / viewport[2] : 0
        right = right !== undefined ? (right - viewport[0]) / viewport[2] : 1
        bottom = bottom !== undefined ? (bottom - viewport[1]) / viewport[3] : 1

        if (gl.vertexBuffer == null) {
            gl.vertexBuffer = gl.createBuffer()
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, top, left, bottom, right, top, right, bottom]), gl.STATIC_DRAW)

        if (gl.texCoordBuffer == null) {
            gl.texCoordBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.texCoordBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)
        }
        if (this.vertexAttribute == null) {
            this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex')
            gl.enableVertexAttribArray(this.vertexAttribute)
        }
        if (this.texCoordAttribute == null) {
            this.texCoordAttribute = gl.getAttribLocation(this.program, '_texCoord')
            gl.enableVertexAttribArray(this.texCoordAttribute)
        }

        gl.useProgram(this.program)
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer)
        gl.vertexAttribPointer(this.vertexAttribute, 2, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.texCoordBuffer)
        gl.vertexAttribPointer(this.texCoordAttribute, 2, gl.FLOAT, false, 0, 0)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    Shader.getDefaultShader = function() {
        gl.defaultShader || (gl.defaultShader = new Shader())
        return gl.defaultShader
    }

    return Shader
}())

export const Texture = (function() {
    let canvas = null

    function getCanvas({ height, width })
    {
        if (canvas == null) {
            canvas = document.createElement('canvas')
        }

        canvas.height = height
        canvas.width = width

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, width, height)

        return ctx
    }

    function Texture(width, height, format, type)
    {
        this.gl = gl
        this.id = gl.createTexture()

        this.format = format
        this.height = height
        this.width = width
        this.type = type

        gl.bindTexture(gl.TEXTURE_2D, this.id)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        if (width && height) {
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null)
        }
    }

    Texture.fromElement = function(element) {
        const texture = new Texture(0, 0, gl.RGBA, gl.UNSIGNED_BYTE)
        texture.loadContentsOf(element)

        return texture
    }

    Texture.prototype.loadContentsOf = function(element) {
        this.height = element.height || element.videoHeight
        this.width = element.width || element.videoWidth

        gl.bindTexture(gl.TEXTURE_2D, this.id)
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, this.type, element)
    }

    Texture.prototype.initFromBytes = function(width, height, data) {
        this.height = height
        this.width = width

        this.type = gl.UNSIGNED_BYTE
        this.format = gl.RGBA

        gl.bindTexture(gl.TEXTURE_2D, this.id)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, this.type, new Uint8Array(data))
    }

    Texture.prototype.destroy = function() {
        gl.deleteTexture(this.id)
        this.id = null
    }

    Texture.prototype.use = function(unit) {
        gl.activeTexture(gl.TEXTURE0 + (unit || 0))
        gl.bindTexture(gl.TEXTURE_2D, this.id)
    }

    Texture.prototype.unuse = function(unit) {
        gl.activeTexture(gl.TEXTURE0 + (unit || 0))
        gl.bindTexture(gl.TEXTURE_2D, null)
    }

    Texture.prototype.ensureFormat = function(width, height, format, type) {
        // Allow passing an existing texture instead of individual arguments
        if (arguments.length === 1) {
            const texture = arguments[0]

            width = texture.width
            height = texture.height
            format = texture.format
            type = texture.type
        }

        // Change the format only if required
        if (width !== this.width || height !== this.height || format !== this.format || type !== this.type) {
            this.format = format
            this.height = height
            this.width = width
            this.type = type

            gl.bindTexture(gl.TEXTURE_2D, this.id)
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null)
        }
    }

    Texture.prototype.drawTo = function(callback) {
        gl.framebuffer = gl.framebuffer || gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, gl.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0)

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Incomplete framebuffer')
        }

        gl.viewport(0, 0, this.width, this.height)

        callback()

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    Texture.prototype.fillUsingCanvas = function(callback) {
        callback(getCanvas(this))

        this.type = gl.UNSIGNED_BYTE
        this.format = gl.RGBA

        gl.bindTexture(gl.TEXTURE_2D, this.id)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)

        return this
    }

    Texture.prototype.toDataUrl = function() {
        this.use()

        const { height, width } = this,
            data = new Uint8Array(width * height * 4),

            c = getCanvas({ height, width }),
            img = c.createImageData(width, height)

        Shader.getDefaultShader().drawRect()
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data)

        img.data = new Uint8ClampedArray(data)
        c.putImageData(img, 0, 0)

        return canvas.toDataURL()
    }

    Texture.prototype.toImage = function(image) {
        image.src = this.toDataUrl()
    }

    Texture.prototype.swapWith = function(other) {
        let temp

        temp = other.width
        other.width = this.width
        this.width = temp

        temp = other.height
        other.height = this.height
        this.height = temp

        temp = other.format
        other.format = this.format
        this.format = temp

        temp = other.id
        other.id = this.id
        this.id = temp
    }

    return Texture
}())

function wrapTexture(texture)
{
    function loadContentsOf(element)
    {
        gl = this._.gl
        this._.loadContentsOf(element)
    }
    function destroy()
    {
        gl = this._.gl
        this._.destroy()
    }

    return {
        _: texture,
        loadContentsOf,
        destroy
    }
}

function texture(element)
{
    return wrapTexture(Texture.fromElement(element))
}

function initialize(width, height)
{
    let oes = 'OES_texture_float',
        type = gl.UNSIGNED_BYTE

    if (gl.getExtension(oes) && gl.getExtension(oes + '_linear')) {
        const testTexture = new Texture(100, 100, gl.RGBA, gl.FLOAT)

        try { // Only use gl.FLOAT if we can render to it
            testTexture.drawTo(() => { type = gl.FLOAT })
        } catch (e) {
        }

        testTexture.destroy()
    }
    if (this._.texture) {
        this._.texture.destroy()
    }
    if (this._.spareTexture) {
        this._.spareTexture.destroy()
    }

    this.height = height
    this.width = width

    this._.texture = new Texture(width, height, gl.RGBA, type)
    this._.spareTexture = new Texture(width, height, gl.RGBA, type)
    this._.extraTexture = this._.extraTexture || new Texture(0, 0, gl.RGBA, type)
    this._.flippedShader = this._.flippedShader || new Shader(null, `
        uniform sampler2D texture;
        varying vec2 texCoord;
        void main() {
            gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));
        }
    `)

    this._.isInitialized = true
}

/*
* Draw a texture to the canvas, with an optional width
* and height to scale. If no width and height are given
* then the original texture width and height are used.
*/
function draw(texture, width, height)
{
    if (!this._.isInitialized || texture._.width !== this.width || texture._.height !== this.height) {
        initialize.call(this, width || texture._.width, height || texture._.height)
    }

    texture._.use()

    this._.texture.drawTo(() => {
        Shader.getDefaultShader().drawRect()
    })

    return this
}

function update()
{
    this._.texture.use()
    this._.flippedShader.drawRect()

    return this
}

function replace(node)
{
    node.parentNode.insertBefore(this, node)
    node.parentNode.removeChild(node)

    return this
}

function contents()
{
    const { width, height } = this._.texture,
        texture = new Texture(width, height, gl.RGBA, gl.UNSIGNED_BYTE)

    this._.texture.use()

    texture.drawTo(() => {
        Shader.getDefaultShader().drawRect()
    })

    return wrapTexture(texture)
}

/*
* Gets the implementation of ImageData
* with Uint8ClampedArray of pixel values [r,g,b,a...]
* Length of the array will be width * height * 4
*/
function getImageData()
{
    const { height, width } = this._.texture,
        data = new Uint8Array(width * height * 4)

    this._.texture.use()

    Shader.getDefaultShader().drawRect()
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data)

    return new ImageData(Uint8ClampedArray.from(data), width, height)
}

function wrap(func)
{
    return function() {
        gl = this._.gl
        return func.apply(this, arguments)
    }
}

function simpleShader(shader, uniforms, textureIn, textureOut)
{
    (textureIn || this._.texture).use()

    this._.spareTexture.drawTo(() => {
        shader.uniforms(uniforms).drawRect()
    })

    this._.spareTexture.swapWith(textureOut || this._.texture)
}

function clamp(lo, value, hi)
{
    return Math.max(lo, Math.min(value, hi))
}

function splineInterpolate(points)
{
    const spl = new SplineInterpolator(points),
        array = []

    for (let i = 0; i < 256; i++) {
        array.push(clamp(0, Math.floor(spl.interpolate(i / 255) * 256), 255))
    }

    return array
}

function brightnessContrast(brightness, contrast)
{
    gl.brightnessContrast || (gl.brightnessContrast = new Shader(null, f.brightnesscontrast))

    simpleShader.call(this, gl.brightnessContrast, {
        brightness: clamp(-1, brightness, 1),
        contrast: clamp(-1, contrast, 1)
    })

    return this
}

function curves(red, green, blue)
{
    red = splineInterpolate(red)

    if (arguments.length === 1) {
        green = blue = red
    } else {
        green = splineInterpolate(green)
        blue = splineInterpolate(blue)
    }

    const array = []
    for (let i = 0; i < 256; i++) {
        array.splice(array.length, 0, red[i], green[i], blue[i], 255)
    }

    this._.extraTexture.initFromBytes(256, 1, array)
    this._.extraTexture.use(1)

    gl.curves = gl.curves || new Shader(null, f.curves)
    gl.curves.textures({ map: 1 })

    simpleShader.call(this, gl.curves, {})

    return this
}

function denoise(exponent)
{
    gl.denoise || (gl.denoise = new Shader(null, f.denoise))

    for (let i = 0; i < 2; i++) {
        simpleShader.call(this, gl.denoise, {
            texSize: [this.width, this.height],
            exponent: Math.max(0, exponent)
        })
    }

    return this
}

function hueSaturation(hue, saturation)
{
    gl.hueSaturation || (gl.hueSaturation = new Shader(null, f.huesaturation))

    simpleShader.call(this, gl.hueSaturation, {
        saturation: clamp(-1, saturation, 1),
        hue: clamp(-1, hue, 1)
    })

    return this
}

function noise(amount)
{
    gl.noise || (gl.noise = new Shader(null, f.noise))

    simpleShader.call(this, gl.noise, {
        amount: clamp(0, amount, 1)
    })

    return this
}

function sepia(amount)
{
    gl.sepia || (gl.sepia = new Shader(null, f.sepia))

    simpleShader.call(this, gl.sepia, {
        amount: clamp(0, amount, 1)
    })

    return this
}

function unsharpMask(radius, strength)
{
    gl.unsharpMask || (gl.unsharpMask = new Shader(null, f.unsharpmask))

    // Store a copy of the current texture in the second texture unit
    this._.extraTexture.ensureFormat(this._.texture)
    this._.texture.use()

    this._.extraTexture.drawTo(() => {
        Shader.getDefaultShader().drawRect()
    })

    // Blur the current texture, then use the stored texture to detect edges
    this._.extraTexture.use(1)
    this.triangleBlur(radius)

    gl.unsharpMask.textures({ originalTexture: 1 })

    simpleShader.call(this, gl.unsharpMask, { strength })

    this._.extraTexture.unuse(1)

    return this
}

function vibrance(amount)
{
    gl.vibrance || (gl.vibrance = new Shader(null, f.vibrance))

    simpleShader.call(this, gl.vibrance, {
        amount: clamp(-1, amount, 1)
    })

    return this
}

function vignette(size, amount)
{
    gl.vignette || (gl.vignette = new Shader(null, f.vignette))

    simpleShader.call(this, gl.vignette, {
        amount: clamp(0, amount, 1),
        size: clamp(0, size, 1)
    })

    return this
}

function lensBlur(radius, brightness, angle)
{
    gl.lensBlurPrePass || (gl.lensBlurPrePass = new Shader(null, f.blur.lensBlurPrePass))

    gl.lensBlur0 || (gl.lensBlur0 = new Shader(null, f.blur.lensBlur0))
    gl.lensBlur1 || (gl.lensBlur1 = new Shader(null, f.blur.lensBlur1))
    gl.lensBlur2 || (gl.lensBlur2 = new Shader(null, f.blur.lensBlur2)
        .textures({ texture1: 1 }))

    const power = 10 ** clamp(-1, brightness, 1),
        dir = []

    for (let i = 0; i < 3; i++) {
        const a = angle + i * Math.PI * 2 / 3

        dir.push([
            radius * Math.sin(a) / this.width,
            radius * Math.cos(a) / this.height
        ])
    }

    // Remap the texture values, which will help make the bokeh effect
    simpleShader.call(this, gl.lensBlurPrePass, { power })

    // Blur two rhombi in parallel into extraTexture
    this._.extraTexture.ensureFormat(this._.texture)

    simpleShader.call(this, gl.lensBlur0, {
        delta0: dir[0]
    }, this._.texture, this._.extraTexture)

    simpleShader.call(this, gl.lensBlur1, {
        delta0: dir[1],
        delta1: dir[2]
    }, this._.extraTexture, this._.extraTexture)

    // Blur the last rhombus and combine with extraTexture
    simpleShader.call(this, gl.lensBlur0, {
        delta0: dir[1]
    })

    this._.extraTexture.use(1)
    simpleShader.call(this, gl.lensBlur2, {
        power: 1 / power,
        delta0: dir[2]
    })

    return this
}

function tiltShift(startX, startY, endX, endY, blurRadius, gradientRadius)
{
    gl.tiltShift || (gl.tiltShift = new Shader(null, f.tiltshift))

    const dx = endX - startX, dy = endY - startY,
        d = Math.sqrt(dx * dx + dy * dy)

    simpleShader.call(this, gl.tiltShift, {
        texSize: [this.width, this.height],
        delta: [dx / d, dy / d],
        start: [startX, startY],
        end: [endX, endY],
        gradientRadius,
        blurRadius
    })

    simpleShader.call(this, gl.tiltShift, {
        texSize: [this.width, this.height],
        delta: [-dy / d, dx / d],
        start: [startX, startY],
        end: [endX, endY],
        gradientRadius,
        blurRadius
    })

    return this
}

function triangleBlur(radius)
{
    gl.triangleBlur || (gl.triangleBlur = new Shader(null, f.triangleblur))

    simpleShader.call(this, gl.triangleBlur, {
        delta: [radius / this.width, 0]
    })

    simpleShader.call(this, gl.triangleBlur, {
        delta: [0, radius / this.height]
    })

    return this
}

function zoomBlur(centerX, centerY, strength)
{
    gl.zoomBlur || (gl.zoomBlur = new Shader(null, f.zoomblur))

    simpleShader.call(this, gl.zoomBlur, {
        texSize: [this.width, this.height],
        center: [centerX, centerY],
        strength
    })

    return this
}

function colorHalftone(centerX, centerY, angle, size)
{
    gl.colorHalftone || (gl.colorHalftone = new Shader(null, f.colorhalftone))

    simpleShader.call(this, gl.colorHalftone, {
        texSize: [this.width, this.height],
        center: [centerX, centerY],
        scale: Math.PI / size,
        angle
    })

    return this
}

function dotScreen(centerX, centerY, angle, size)
{
    gl.dotScreen || (gl.dotScreen = new Shader(null, f.dotscreen))

    simpleShader.call(this, gl.dotScreen, {
        texSize: [this.width, this.height],
        center: [centerX, centerY],
        scale: Math.PI / size,
        angle
    })

    return this
}

function edgeWork(radius)
{
    gl.edgeWork1 || (gl.edgeWork1 = new Shader(null, f.edge.edgeWork1))
    gl.edgeWork2 || (gl.edgeWork2 = new Shader(null, f.edge.edgeWork2))

    simpleShader.call(this, gl.edgeWork1, {
        delta: [radius / this.width, 0]
    })

    simpleShader.call(this, gl.edgeWork2, {
        delta: [0, radius / this.height]
    })

    return this
}

function hexagonalPixelate(centerX, centerY, scale)
{
    gl.hexagonalPixelate || (gl.hexagonalPixelate = new Shader(null, f.hexagonalpixelate))

    simpleShader.call(this, gl.hexagonalPixelate, {
        texSize: [this.width, this.height],
        center: [centerX, centerY],
        scale
    })

    return this
}

function ink(strength)
{
    gl.ink || (gl.ink = new Shader(null, f.ink))

    simpleShader.call(this, gl.ink, {
        strength: strength * strength * strength * strength * strength,
        texSize: [this.width, this.height]
    })

    return this
}

function bulgePinch(centerX, centerY, radius, strength)
{
    gl.bulgePinch || (gl.bulgePinch = new Shader(null, f.bulgepinch))

    simpleShader.call(this, gl.bulgePinch, {
        texSize: [this.width, this.height],
        strength: clamp(-1, strength, 1),
        center: [centerX, centerY],
        radius
    })

    return this
}

function matrixWarp(matrix, inverse, useTextureSpace)
{
    gl.matrixWarp || (gl.matrixWarp = new Shader(null, f.matrixwarp))

    // Flatten all members of matrix into one big list
    matrix = Array.prototype.concat.apply([], matrix)

    // Extract a 3x3 matrix out of the arguments
    if (matrix.length === 4) {
        matrix = [
            matrix[0], matrix[1], 0,
            matrix[2], matrix[3], 0,
            0, 0, 1
        ]
    } else if (matrix.length !== 9) {
        throw new Error('Can only warp with 2x2 or 3x3 matrix')
    }

    simpleShader.call(this, gl.matrixWarp, {
        matrix: inverse ? getInverse(matrix) : matrix,
        useTextureSpace: useTextureSpace | 0,
        texSize: [this.width, this.height]
    })

    return this
}

function perspective(before, after)
{
    const a = getSquareToQuad.apply(null, after),
        b = getSquareToQuad.apply(null, before),
        c = multiply(getInverse(a), b)

    return this.matrixWarp(c)
}

function swirl(centerX, centerY, radius, angle)
{
    gl.swirl || (gl.swirl = new Shader(null, f.swirl))

    simpleShader.call(this, gl.swirl, {
        texSize: [this.width, this.height],
        center: [centerX, centerY],
        radius,
        angle
    })

    return this
}

/* eslint-disable object-property-newline */
function methods()
{
    return {
        texture, draw, update, replace, contents, getImageData,
        colorHalftone, triangleBlur, unsharpMask, perspective,
        brightnessContrast, hexagonalPixelate, hueSaturation,
        edgeWork, lensBlur, zoomBlur, denoise, curves,
        matrixWarp, bulgePinch, dotScreen, tiltShift,
        noise, sepia, swirl, ink, vignette, vibrance
    }
}

/**
* @param {number} width
* @param {number} height
* @return {HTMLCanvasElement}
*/
export function createCanvas(width = 300, height = 150)
{
    if (typeof document === 'undefined') {
        throw new TypeError('DOM document is not defined')
    }

    const c = document.createElement('canvas')

    c.height = height
    c.width = width

    return c
}

/**
* @param {number} width
* @param {number} height
* @return {WebGLRenderingContext}
*/
export function createWebGLContext(width, height)
{
    let ctx, c = createCanvas(width, height)

    if ((ctx = getContext(c, options))) {
        ctx.getExtension('WEBGL_color_buffer_float')
        ctx.clearColor(0, 0, 0, 0)
    }

    return ctx
}

export function init(width, height)
{
    gl || (gl = createWebGLContext(width, height))

    if (!isWebGLRenderingContext(gl)) {
        throw new Error('This browser does not support WebGL')
    }

    const f = methods()

    gl.canvas._ = {
        isInitialized: false,
        flippedShader: null,
        spareTexture: null,
        texture: null,
        gl
    }

    Object.keys(f).forEach(n => {
        gl.canvas[n] = wrap(f[n])
    })

    return gl.canvas
}
