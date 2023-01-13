<script>
    /**
    * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
    * @see https://stackoverflow.com/questions/63561767/typeerror-failed-to-construct-clipboarditem-failed-to-convert-value-to-blob
    * @see https://medium.com/geekculture/explore-clipboard-operation-in-javascript-c6399619c0ac
    * @see https://russianblogs.com/article/74741442622
    * @see https://habr.com/ru/sandbox/53689
    */
    export default {
        data: () => ({
            clipboard: null,
            sources: []
        }),
        methods: {
            extract({ clipboardData }, filter)
            {
                return Array.prototype.slice.call((clipboardData || window.clipboardData)?.items || []).filter(filter)
            },
            async paste(e)
            {
                let data = []

                try {

                    const { permission, items } = await this.getClipboardContents()

                    data = permission.state === 'granted'
                        ? items.map(p => p.then(blob => {
                            return new Promise((resolve, reject) => {
                                const r = new FileReader()

                                r.onerror = reject
                                r.onload = ({ target }) => {
                                    resolve(target.result)
                                }

                                r.readAsDataURL(blob)
                            })
                        }))
                        : this.extract(e, el => el.type.startsWith('image/'))
                            .map(item => new Promise((resolve, reject) => {
                                const r = new FileReader(),
                                    b = item.getAsFile()

                                r.onerror = reject
                                r.onload = ({ target }) => {
                                    resolve(target.result)
                                }

                                r.readAsDataURL(b)
                            }))

                } catch (e) {
                }

                data.length && (this.sources = data)

                this.$emit('paste', this)
            },
            async getClipboardContents()
            {
                let permission = { state: 'denied' },
                    items = []

                try {

                    // permission = await navigator.permissions.query({ name: 'clipboard-read' })

                    if (['granted','prompt'].includes(permission.state)) {
                        const clipboardItems = await this.clipboard.read()

                        for (const item of clipboardItems) {
                            for (const type of item.types) {
                                if (type.startsWith('image/')) {
                                    items.push(item.getType(type))
                                }
                            }
                        }
                    }

                } catch (e) {
                }

                return { permission, items }
            },
            async writeClipboardContent(message = '')
            {
                let permission = { state: 'denied' },
                    type = 'text/plain'

                try {

                    // permission = await navigator.permissions.query({ name: 'clipboard-write' })

                    if (['granted','prompt'].includes(permission.state)) {
                        const blob = new Blob([message], { type })

                        await this.clipboard.write([new ClipboardItem({ [type]: blob })])

                        return true
                    }

                } catch (e) {
                }

                return false
            },
            rem()
            {
                window.removeEventListener('paste', this.paste)
            },
            add()
            {
                window.addEventListener('paste', this.paste)
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('input:focus', this.rem.bind(this))
            this.$bus.$off('input:blur', this.add.bind(this))

            this.rem()
        },
        beforeMount()
        {
            this.$bus.$on('input:focus', this.rem.bind(this))
            this.$bus.$on('input:blur', this.add.bind(this))
        },
        mounted()
        {
            this.clipboard = navigator.clipboard

            this.add()
        },
        render()
        {
            return this.$scopedSlots.default({})
        }
    }
</script>
