import { openLink } from '~/utils/common/open.mjs'

const link = (m, p1, p2) => `<a href="https://vk.com/${p1}" target="_blank">${p2}</a>`
const text = (m, p1, p2) => p2

const expr = /\[([_\w\d]+)(?::[_\-\w\d]+)?\|([a-zа-яё!-_ ]+)]/gi

export const links = s => expr.test(s) ? s.replace(expr, link) : s
export const plain = s => expr.test(s) ? s.replace(expr, text) : s

export default {
    methods: {
        commitSettings(set)
        {
            this.$store.commit('socket/setSettings', set)
            this.$store.commit('socket/init')
        },
        followLink({ url, event_url }, e)
        {
            if ((!e || !e.shiftKey) && (url || event_url)) {
                openLink(url || event_url)
            }
        },
        links
    }
}
