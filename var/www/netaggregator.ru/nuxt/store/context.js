export const state = () => ({
    active: { chatbot: null, cover: null, graph: null, stream: null, widget: null },

    icons: null,
    event: null,

    buttons: Object.freeze({
        chatbot: [
            { icon: 'connections' },
            { icon: 'mailing'     },
            { icon: 'dialogs'     }
        ],
        cover: [
            { icon: 'connections' },
            { icon: 'templates'   },
            { icon: 'list'        }
        ],
        graph: [
            { icon: 'new'         },
            { icon: 'open'        },
            { icon: 'link'        },
            { icon: 'webcam'      },
            { icon: 'calc'        },
            { icon: 'pixabay'     }
        ],
        stream: [
            { icon: 'history'     },
            { icon: 'chart'       },
            { icon: 'stream'      }
        ],
        widget: [
            { icon: 'text'        },
            { icon: 'list'        },
            { icon: 'table'       },
            { icon: 'tiles'       },
            { icon: 'cover_list'  },
            { icon: 'match'       },
            { icon: 'donation'    }
        ]
    })
})

export const mutations = {
    set(state, payload)
    {
        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    }
}
