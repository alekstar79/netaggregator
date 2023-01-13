import { openLink } from '~/utils/common/open.mjs'
import { popup } from '~/utils/common/popup.mjs'
import { delay } from '~/utils/common/delay.mjs'

const loc = !!(process.env.IS_DEV && process.env.LOC),
    wrap = cb => cb,
    noop = () => {},

    HEIGHT = 560,
    WIDTH = 780

export default {
    data: () => ({
        reload: false
    }),
    computed: {
        fail: {
            get() {
                const e = this.$store.state.app.error

                return e && (e.error_code === 5 || 'server_side_auth' in e)
            },
            set(error) {
                this.$store.commit('app/set', { error })
            }
        },
        presence() {
            return this.vkapp ? this.fail || this.reload : true
        },
        action() {
            return !this.fail && this.user ? 'logout' : 'login'
        },
        vkapp() {
            return this.$store.state.app.vkapp
        },
        user() {
            return this.$store.state.app.user
        }
    },
    methods: {
        getHost()
        {
            return loc ? process.env.LOCAL_URL : process.env.ORIGIN_URL
        },
        close()
        {
            this.$emit('close')

            if (this.reload) {
                this.requestSettings({})
            }
        },
        popup(url, resolve, timeout)
        {
            let win, self = this

            window.addEventListener('message', function onmessage(e) {
                if (e.origin !== self.getHost()) return

                window.removeEventListener('message', onmessage)
                win && win.close()

                self.requestSettings({ resolve, timeout })
            })

            win = popup({ url, width: WIDTH, height: HEIGHT })
        },
        auth(timeout)
        {
            const link = `${this.getHost()}/${this.action}/vk`

            return new Promise(resolve => {
                switch (true) {
                    case this.reload:
                        this.requestSettings({ resolve, timeout })
                        break

                    case this.$BROWSER.NATIVE_APP:
                        openLink(link, '_parent')
                        delay(1e3).then(() => {
                            this.reload = true
                            resolve()
                        })
                        break

                    default:
                        this.popup(link, resolve, timeout)
                }
            })
        },
        requestSettings: wrap(async function({ timeout, resolve = noop })
        {
            typeof timeout === 'number' || (timeout = 0)

            const action = this.action

            this.reload = false
            this.close()

            try {

                switch (action) {
                    case 'login':
                        await this.$store.dispatch('app/settingsLoad')
                        await Promise.all([
                            this.$store.dispatch('chatbot/chatsLoad', {}),
                            this.$store.dispatch('cover/coversLoad', {})
                        ])
                        break
                    case 'logout':
                        this.$store.commit('chatbot/set', { list: [] })
                        this.$store.commit('cover/set', { list: [] })
                        this.$store.commit('app/setSettings', {})
                        this.$cookies.remove('NetXBot')
                        break
                }

                this.$bus.$emit('settings:reload', action)

            } catch (e) {
            }

            setTimeout(resolve, timeout)
        })
    }
}
