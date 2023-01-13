import { cog, down, remove, rotate, up } from '../../assets/data/canvas-icons.mjs'
import { setControls } from './index.mjs'

/**
* Add rembg top-left icon
*/
export function imgAddFunctionality(fabric)
{
    const browser = typeof process === 'undefined' || process.browser,

        toDataUrl = url => fetch(url).then(response => response.blob()).then(upload),
        replace = b64 => b64.replace(/application\/octet-stream/, 'image/png'),

        apply = function() {
            return new Promise((resolve, reject) => {
                if (!this.wbg) return reject(new Error('nothing_to_apply'))

                const options = { crossOrigin: 'anonymous', ...this.toObject(['wbg']) },
                    idx = this.canvas._objects.findIndex(o => o === this)

                fabric.Image.fromURL(this.wbg, img => {
                    this.canvas.insertAt(img, idx, true)
                    this.trigger('programmatic')
                    resolve()

                }, options)
            })
        },

        removeBg = async function(type = 'blob') {
            if (this.wbg || this.query) return 'block'

            if (!this.src) {
                throw new Error('unexpected_internal_error')
            }

            try {

                const body = new URLSearchParams({ src: this.src })

                this.query = body

                this.wbg = replace(
                    await transform(
                        await fetch('/node/rembg', { method: 'POST', body })
                            .then(data => data[type]())
                    )
                )

                if (!/data:image\/(jpe?g|png|gif|webp)/.test(this.wbg)) {
                    this.query = this.wbg = undefined
                }

                return this.wbg ? 'block' : 'none'

            } catch (e) {
                this.query = this.wbg = undefined
            }

            throw new Error('service_unavailable')
        },

        loading = async function() {
            if (this.wbg) return 'block'

            if (!this.src) {
                throw new Error('unexpected_internal_error')
            }

            let i = 25, completed = false

            do {

                await new Promise(delay => setTimeout(delay, 500))

                completed = !!this.wbg

            } while (!completed && --i)

            return this.wbg
                ? 'block'
                : 'none'
        }

    /**
     * Read file
     * @param {File|Blob} file
     * @return {Promise<String>}
     */
    function upload(file)
    {
        return new Promise((resolve, reject) => {
            const r = new FileReader()

            r.onerror = reject
            r.onload = () => {
                resolve(r.result)
            }

            r.readAsDataURL(file)
        })
    }

    /**
     * Transform imagedata to b64data and set image src
     * @param {{convert,url}|Blob} data
     * @return {Promise<String>}
     */
    function transform(data)
    {
        switch (true) {
            case data instanceof Blob:
                return upload(data)
            case 'convert' in data:
                return toDataUrl(data.url)
        }
    }

    fabric.Image.prototype.initialize = (function(initialize) {
        return browser ? function(...args) {
            initialize.call(this, ...args)

            setControls(this, {
                tl: { action: 'scale',    cursor: 'resize'  },
                bl: { action: 'remove',   cursor: 'pointer' },
                br: { action: 'moveUp',   cursor: 'pointer' },
                mb: { action: 'moveDown', cursor: 'pointer' },
                mtr: { action: 'rotate' },
                tr: {
                    cursor: 'pointer',
                    action: () => {
                        this.stopFix = true
                        this.canvas.trigger('image:remove-bg', this)
                        setTimeout(() => {
                            this.stopFix = false
                        }, 200)
                    }
                }
            }, {
                settings: {
                    borderColor: '#0094dd',
                    cornerBackgroundColor: '#0094dd',
                    cornerShape: 'circle',
                    cornerPadding: 7,
                    cornerSize: 20
                },
                mtr: { icon: rotate },
                tl:  { icon: null },
                tr:  { icon: cog  },
                mb:  { icon: down },
                br:  { icon: up },
                bl:  { icon: remove }
            })

        } : initialize

    })(fabric.Image.prototype.initialize)

    fabric.Image.prototype.removeBg = removeBg
    fabric.Image.prototype.loading = loading
    fabric.Image.prototype.apply = apply

    return fabric
}
