import load from './load-script.js'

/**
* @see https://github.com/gajus/youtube-player/blob/master/src/loadYouTubeIframeApi.js
*/
export default function(emitter)
{
    emitter || (emitter = { trigger: console.log })

    return new Promise(resolve => {
        if (window.YT && window.YT.Player && window.YT.Player instanceof Function) {
            resolve(window.YT)
            return

        } else {
            const protocol = window.location.protocol === 'http:' ? 'http:' : 'https:'

            load(protocol + '//www.youtube.com/iframe_api', error => {
                if (error) emitter.trigger('error', error)
            })
        }

        const previous = window.onYouTubeIframeAPIReady

        // The API will call this function when page has finished downloading
        // the JavaScript for the player API.
        window.onYouTubeIframeAPIReady = () => {
            if (previous) previous()

            resolve(window.YT)
        }
    })
}
