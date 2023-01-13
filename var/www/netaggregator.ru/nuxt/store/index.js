import { errorHandler } from '~/mixins/common/error'
import { redirect } from '~/utils/common/open.mjs'
import { greeting } from '~/utils/console'

import vk from '@vkontakte/vk-bridge'

function testToken(access_token)
{
    return vk.send('VKWebAppCallAPIMethod', { params: { v: '5.131', access_token }, method: 'users.get' }).catch(getToken)
}

function getToken()
{
    return vk.send('VKWebAppGetAuthToken', { app_id: Number(process.env.APP.ID), scope: process.env.APP.USCOPE })
}

/**
 * @param {String} hash
 * @param {String} [location]
 * @return {?HTMLIFrameElement}
 */
function redirectByHash(hash, location = 'https://netaggregator.ru')
{
    if (window.location.toString().split('#', 2)[1] === hash) {
        return redirect(location, openPopupWindow)
    }
}

function openPopupWindow()
{
    const wrap = document.createElement('div'),
        div = document.createElement('div'),

        lnk1 = document.createElement('a'),
        lnk2 = document.createElement('a')

    wrap.setAttribute('id', 'redirection_issue')

    lnk1.textContent = 'Перейти в веб приложение'
    lnk2.textContent = 'Остаться в мини приложении'

    lnk2.setAttribute('href', 'javascript:redirection_issue.remove()')
    lnk1.setAttribute('href', 'https://netaggregator.ru')
    lnk1.setAttribute('target', '_top')

    div.appendChild(lnk1)
    div.appendChild(lnk2)
    wrap.appendChild(div)

    document.body.insertAdjacentElement('beforeend', wrap)

    setTimeout(() => {
        wrap.style.opacity = '1'
    })
}

function goodToken(token, scope)
{
    if (!token) return false

    const needed = process.env.APP.USCOPE.split(','),
        contain = scope.split(',')

    return contain.length
        ? !needed.some(i => !contain.includes(i))
        : false
}

function appWindowSize()
{
    const clamp = (v, l = 0) => v < l ? l : v + .5 | 0,
        oh = window.outerHeight,
        ow = window.outerWidth

    return {
        height: clamp(oh - oh / 4, 620),
        width: clamp(ow * 4 / 5, 991) // 2/3 960
    }
}

function tokenValidation({ store, $bus, $cookies })
{
    let { access_token, scope } = $cookies.get('utoken') || {},
        { vkapp } = store.state.app || {},

        resolve = goodToken(access_token, scope)
            ? testToken(access_token)
            : getToken()

    return resolve
        .catch(response => {
            $bus.$emit('snack', {
                content: errorHandler(response).reason || 'Unknown error',
                color: 'error'
            })
        })
        .then((response = {}) => {
            if (response.access_token) {
                access_token = response.access_token

                $cookies.set('utoken', response, {
                    path: '/',
                    sameSite: 'none',
                    maxAge: 8.64e5,
                    secure: true
                })
            }
            if (access_token) {
                store.commit('app/set', { utoken: access_token })
            }
            if (vkapp.vk_ref === 'group_menu') {
                redirectByHash('ref_menu')
            }
        })
}

async function vkBridgeInit(store, isMobile)
{
    vk.subscribe(({ detail }) => { store.commit('vkevents/set', detail) })

    await vk.send('VKWebAppInit', {})

    vk.send('VKWebAppGetUserInfo').then(info => {
        store.commit('app/set', { user: Object.assign({}, store.state.app.user, info) })
    })

    if (!isMobile && vk.supports('VKWebAppResizeWindow')) {
        vk.send('VKWebAppResizeWindow', appWindowSize())
    }

    store.commit('app/set', {
        standalone: vk.isStandalone(),
        webview: vk.isWebView(),
        embed: vk.isEmbedded(),
        frame: vk.isIframe()
    })
}

function checkServerError(app, state)
{
    if (!state.app.error) return

    let snack = () => {}

    switch (true) {
        case 'server_side_auth' in state.app.error:
            snack = ({ locale }) => app.$bus.$emit('snack', {
                color: 'error',
                timeout: 9000,

                content: state.app.locale === 'ru' || locale === 'ru'
                    ? 'Некоторые компоненты приложения, требуют серверной авторизации'
                    : 'You must grant server permissions for the app work properly'
            })
            break

        case !!state.app.error.error_msg:
            snack = () => app.$bus.$emit('snack', {
                content: state.app.error.error_msg.split(':')[0],
                color: 'error'
            })
    }

    app.$bus.$on('snack:ready', snack)
}

/**
* @see https://ru.nuxtjs.org/docs/2.x/directory-structure/store
*/
export const strict = false

export const actions = {
    /* async nuxtServerInit({ state, commit, dispatch }, { app, query, env }) {
        let locale, vkapp = {}

        if (Object.prototype.hasOwnProperty.call(query, 'vk_app_id')) {
            vkapp = extract(query)

            if (query.sign === h(vkapp, env.APP.SECRET)) {
                commit('app/set', { vkapp })
            }
        }
        if ((locale = app.$cookies.get('locale') || vkapp.vk_language)) {
            commit('app/set', { locale })
            app.i18n.locale = locale
        }

        await dispatch('app/settingsLoad')
    }, */
    nuxtClientInit(store, { app /*, $vuetify, $bus, env */ }) {
        /* const // { LIGHT: LT, MEDAL: MD, SNOW: SN, TREE: TR, TILT: TL } = env.EXTRA || {},
            { IS_MOBILE: M } = app.$BROWSER,

            { color: cl, cover: cv, theme: tm } = this.state.app,
            { color = cl, cover = cv, theme = tm, hints = !M } = await app.$ls.get('theme', {}),
            [/* light, medal, snow, tree, tilt, *!/owner] = await app.$ls.getMany(
                [/* 'light','medal','snow','tree','tilt', *!/'owner'],
                [/* !M, !M, !M, !M, !M, *!/false]
            )

        commit('app/set', {
            ...(color && { color }),
            ...(cover && { cover }),
            ...(theme && { theme }),
            ...(hints && { hints }),
            owner
        }) */
        /* !M && commit('app/set', {
            ...(LT && { light }),
            ...(MD && { medal }),
            ...(SN && { snow }),
            ...(TR && { tree }),
            ...(TL && { tilt })
        }) */

        // $vuetify.theme.dark = theme === 'dark'
        // $bus.$emit('theme:inited')

        checkServerError(app, store.state)
        greeting()

        if (store.state.app.vkapp) {
            vkBridgeInit(store, app.$BROWSER.IS_MOBILE)
                .then(() => tokenValidation(app))
                .catch(() => {
                    app.$bus.$emit('snack', {
                        content: 'VK Bridge init error',
                        color: 'error',
                        raw: true
                    })
                })
        }
    }
}
