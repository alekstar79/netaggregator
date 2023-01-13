import loadYouTubeIframeApi from './loadYTApi.js'

const youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig
const timeRegexp = /t=(\d+)[ms]?(\d+)?s?/

/**
* Get id from url
* @param {string} url url
* @return {string} id
*/
export function getIdFromURL(url)
{
    let pieces, id = url.replace(youtubeRegexp, '$1')

    if (id.includes(';')) {
        pieces = id.split(';')

        id = pieces[1].includes('%')
            ? ('http://youtube.com' + decodeURIComponent(pieces[1])).replace(youtubeRegexp, '$1')
            : pieces[0]

    } else if (id.includes('#')) {
        id = id.split('#')[0]
    }

    return id
}

/**
* Get time from url
* @param {string} url url
* @return {number} time
*/
export function getTimeFromURL(url)
{
    if (url === undefined) url = ''

    const times = url.match(timeRegexp)

    if (!times) {
        return 0
    }

    let full = times[0]
    let minutes = times[1]
    let seconds = times[2]

    if (typeof seconds !== 'undefined') {
        seconds = parseInt(seconds, 10)
        minutes = parseInt(minutes, 10)

    } else if (full.includes('m')) {
        minutes = parseInt(minutes, 10)
        seconds = 0

    } else {
        seconds = parseInt(minutes, 10)
        minutes = 0
    }

    return seconds + (minutes * 60)
}

const container = {
    scripts: [],
    events: {},
    YT: null,

    run()
    {
        const self = this

        this.scripts.forEach(callback => {
            callback(self.YT)
        })

        this.scripts = []
    },
    register(callback)
    {
        const self = this

        if (this.YT) {
            setImmediate(() => callback(self.YT))

        } else {
            this.scripts.push(callback)
        }
    }
}

let pid = 0

/**
* @see https://github.com/kaorun343/vue-youtube-embed
*/
export const YouTubePlayer = {
    props: {
        playerHeight: {
            type: [String, Number],
            default: '360'
        },
        playerWidth: {
            type: [String, Number],
            default: '640'
        },
        playerVars: {
            type: Object,
            default: () => ({
                autoplay: 0,
                time: 0
            })
        },
        videoId: {
            type: String
        },
        mute: {
            type: Boolean,
            default: false
        },
        host: {
            type: String,
            default: 'https://www.youtube.com'
        }
    },
    watch: {
        playerHeight: 'setSize',
        playerWidth: 'setSize',
        videoId: 'update',
        mute: 'setMute'
    },
    data() {
        pid += 1

        return {
            elementId: ('youtube-player-' + pid),
            player: {}
        }
    },
    methods: {
        setSize()
        {
            this.player.setSize(this.playerWidth, this.playerHeight)
        },
        setMute(value)
        {
            if (value) {
                this.player.mute()
            } else {
                this.player.unMute()
            }
        },
        update(videoId)
        {
            const name = (this.playerVars.autoplay ? 'load' : 'cue') + 'VideoById'

            if (Object.prototype.hasOwnProperty.call(this.player, name)) {
                this.player[name](videoId)
            } else {
                setTimeout(() => {
                    this.update(videoId)
                }, 100)
            }
        }
    },
    render(h)
    {
        return h('div', [h('div', { attrs: { id: this.elementId } })])
    },
    created()
    {
        const self = this

        container.register(function(YouTube) {
            const { playerHeight, playerWidth, playerVars, videoId, host } = self

            self.player = new YouTube.Player(self.elementId, {
                height: playerHeight,
                width: playerWidth,
                playerVars,
                videoId,
                host,
                events: {
                    onReady(event)
                    {
                        self.setMute(self.mute)
                        self.$emit('ready', event)
                    },
                    onStateChange(event)
                    {
                        if (event.data !== -1) {
                            self.$emit(container.events[event.data], event)
                        }
                    },
                    onError(event)
                    {
                        self.$emit('error', event)
                    }
                }
            })
        })
    },
    mounted()
    {
        loadYouTubeIframeApi().then(YT => {
            const { PlayerState } = YT

            container.YT = YT

            container.events[PlayerState.BUFFERING] = 'buffering'
            container.events[PlayerState.PLAYING] = 'playing'
            container.events[PlayerState.PAUSED] = 'paused'
            container.events[PlayerState.ENDED] = 'ended'
            container.events[PlayerState.CUED] = 'cued'

            this.$nextTick(() => {
                container.run()
            })
        })
    },
    beforeDestroy()
    {
        if (this.player && this.player.destroy) {
            this.player.destroy()
        }

        delete this.player
    }
}
