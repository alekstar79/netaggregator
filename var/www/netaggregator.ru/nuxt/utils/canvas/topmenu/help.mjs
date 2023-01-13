import { toolsBuilder, screenfull } from '../../canvas/index.mjs'

let items = [Compress, IntroJs, Law, Help, Range, Fullscreen, Theme, Language, Auth, About],
    state = false

function authState(ctx)
{
    this.state = `${!ctx.fail && ctx.user ? 'logout' : ctx.reload ? 'reload' : 'login'}`
    this.name = `common.${this.state}`
    this.hidden = !ctx.presence

    if (state) {
        state = false
        return
    }

    state = true

    ctx.stateTools().catch(() => {})
}

async function themeState(ctx)
{
    let { color, cover, theme: store } = await ctx.$ls.get('theme', {}),
        vuetify = ctx.$vuetify.theme.dark ? 'dark' : 'light',
        state = ctx.$store.state.app.theme

    if (store !== state) {
        store = state = vuetify
        await ctx.$ls.set('theme', { theme: store, color, cover })
        ctx.$store.commit('app/set', { theme: state })
    }

    this.theme = state === 'dark' ? 'light' : 'dark'
    this.name = `graph.${this.theme}`

    this.hidden = ctx.$store.state.app.webview

    return { color, cover }
}

async function toggleTheme(ctx)
{
    const { color, cover } = await themeState.call(this, ctx)

    ctx.$store.commit('app/set', { theme: this.theme })

    await ctx.$ls.set('theme', { theme: this.theme, color, cover })

    this.theme = ctx.$store.state.app.theme  === 'dark' ? 'light' : 'dark'

    this.name = `graph.${this.theme}`

    return this.name
}

function toggleLocale(ctx)
{
    const locale = ctx.$i18n.locale === 'ru' ? 'en' : 'ru'

    ctx.$store.commit('app/set', { locale })
    ctx.$i18n.locale = locale
    ctx.$cookies.set('locale', locale, {
        maxAge: 31536000,
        secure: true,
        path: '/'
    })
}

function Compress()
{
    this.hidden = false
    this.name = 'graph.tinypng'
    this.id = 'tinypng'

    this.aicon = 'mdi-external'

    this.reload = () => {}
    this.apply = () => {
        window.open('https://tinypng.com', '_blank')
    }
}

function IntroJs(ctx)
{
    this.hidden = false
    this.name = 'graph.intro'
    this.id = 'introjs'

    this.apply = ctx.startIntro.bind(ctx)
    this.reload = () => {}
}

function Law(ctx)
{
    this.hidden = false
    this.name = 'graph.law_docs'
    this.id = 'law'

    this.reload = () => {}
    this.apply = () => {
        ctx.$bus.$emit('show:law-docs')
    }
}

function Help(ctx)
{
    this.hidden = false
    this.name = 'graph.help'
    this.id = 'help'

    this.reload = () => {}
    this.apply = () => {
        ctx.$bus.$emit('show:help')
    }
}

function Range(ctx)
{
    this.hidden = !ctx.canvas
    this.name = 'graph.scale_bar'
    this.id = 'range'

    this.apply = () => {
        ctx.zoomrange = !ctx.zoomrange
    }
    this.reload = () => {
        this.hidden = !ctx.canvas
    }
}

function Fullscreen()
{
    this.hidden = false
    this.name = `graph.${screenfull.isFullscreen ? 'minimize' : 'fullscreen'}`
    this.id = 'fullscreen'

    this.reload = () => {
        this.name = `graph.${screenfull.isFullscreen ? 'minimize' : 'fullscreen'}`
    }

    this.apply = () => {
        if (screenfull.isEnabled) {
            screenfull.toggle().then(this.reload).catch(() => {})
        }
    }
}

function Fixed(ctx)
{
    this.hidden = false
    this.name = 'graph.fixed'
    this.id = 'fixed'

    this.reload = () => {}
    this.apply = () => {
        const fixed = !ctx.$store.state.canvas.fixed

        ctx.$store.commit('canvas/set', { fixed })

        setTimeout(() => Object.keys(ctx.visible).forEach(pos => {
            ctx.visible[pos] = !ctx.mobile && fixed && ['bottom','top'].includes(pos)
        }))
    }
}

function Theme(ctx)
{
    this.reload = themeState.bind(this, ctx)
    this.apply = toggleTheme.bind(this, ctx)

    ctx.$bus.$on('theme:inited', this.reload)

    this.thenable = true
    this.hidden = false
    this.id = 'theme'
}

function Language(ctx)
{
    this.hidden = false
    this.name = 'common.language'
    this.id = 'language'

    this.reload = () => {}

    this.apply = () => {
        toggleLocale(ctx)
    }
}

function Auth(ctx)
{
    this.reload = authState.bind(this, ctx)
    this.id = 'auth'

    this.apply = () => {
        ctx.auth().then(this.reload)
    }

    authState.call(this, ctx)
}

function About(ctx)
{
    this.hidden = false
    this.name = 'graph.about'
    this.id = 'about'

    this.reload = () => {}
    this.apply = () => {
        ctx.toolInset('graph-popup-about')
    }
}

export default function(ctx)
{
    const help = items.slice()

    if (!ctx.mobile) {
        help.splice(4, 0, Fixed)
    }

    this.activator = 'graph.topmenu-help'
    this.items = toolsBuilder(help, ctx, this)
    this.id = 'help'
}
