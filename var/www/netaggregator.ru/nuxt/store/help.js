export const state = () => ({
    section: 'common',

    chatbot: [
        { module: 'chatbot-dialogs-help', tab: 'dialogs', section: 'chatbot' },
        { module: 'chatbot-mailing-help', tab: 'mailing', section: 'chatbot' }
    ],
    cover: [
        { module: 'cover-list-help',      tab: 'covers',    section: 'cover' },
        { module: 'cover-templates-help', tab: 'templates', section: 'cover' }
    ],
    core: [
        { module: 'core-connections-help', tab: 'connections', section: 'core' }
    ],
    stream: [
        { module: 'stream-queue-help',   tab: 'stream',  section: 'stream' },
        { module: 'stream-history-help', tab: 'history', section: 'stream' },
        { module: 'stream-chart-help',   tab: 'chart',   section: 'stream' }
    ],
    widget: [
        { module: 'widget-common-help',   tab: 'widget', section: 'widget' },
        { module: 'widget-text-help',     tab: 'text',   section: 'widget' },
        { module: 'widget-list-help',     tab: 'cards',  section: 'widget' },
        { module: 'widget-table-help',    tab: 'table',  section: 'widget' },
        { module: 'widget-tiles-help',    tab: 'tiles',  section: 'widget' },
        { module: 'widget-covers-help',   tab: 'covers', section: 'widget' },
        { module: 'widget-match-help',    tab: 'match',  section: 'widget' },
        { module: 'widget-donation-help', tab: 'donat',  section: 'widget' }
    ],
    designer: [
        { module: 'graph-help-common',  tab: 'common',  section: 'designer' },
        { module: 'graph-help-right',   tab: 'right',   section: 'designer' },
        { module: 'graph-help-left',    tab: 'left',    section: 'designer' },
        { module: 'graph-help-file',    tab: 'file',    section: 'designer' },
        { module: 'graph-help-edit',    tab: 'edit',    section: 'designer' },
        { module: 'graph-help-image',   tab: 'image',   section: 'designer' },
        { module: 'graph-help-layer',   tab: 'layer',   section: 'designer' },
        { module: 'graph-help-tools',   tab: 'tools',   section: 'designer' },
        { module: 'graph-help-widgets', tab: 'widgets', section: 'designer' }
    ]
})

export const mutations = {
    set(state, payload)
    {
        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    }
}
