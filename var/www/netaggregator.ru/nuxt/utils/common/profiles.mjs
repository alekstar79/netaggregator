export const expr = new RegExp('https:\\/\\/(netaggregator\\.ru)\\/([\\S\\/]+)', 'g')

export function kebabToCamel({ profile, userId })
{
    return { type: profile.replace(/(-\w)/g, m => m[1].toUpperCase()), userId }
}

export function mapping({ type, userId })
{
    try {

        const parts = type.match(/([^\s]*[a-z])(?=[A-Z])[^\s]*/) || [],
            pref = parts[1]?.replace('best', 'top')

        switch (true) {
            case /user/i.test(type) && !!userId:
                return `user:${userId}`

            case /comment/i.test(type):
                return `${pref}Commentor`

            case /repost/i.test(type):
                return `${pref}Reposter`

            case /like/i.test(type):
                return `${pref}Liker`
        }

    } catch (e) {
    }

    return type
}

/**
* @see https://github.com/fabricjs/fabric.js/issues/5724
* @bug onLoadImage (.../fabric/node_modules/jsdom/lib/jsdom/living/nodes/HTMLImageElement-impl.js:34:21)
*
* Error: Unsupported image type
* Fix: convert an object to a string and apply a regexp replace
*/
export function tofile(data)
{
    return JSON.parse(JSON.stringify(data).replace(expr, 'file:///var/www/$1/nuxt/static/$2'))

    /* let rect
    data.objects.forEach(o => {
        if (o.type !== 'widget-profile') return

        if ((rect = o.objects.find(o => o.type === 'rect'))) {
            rect.fill.source = 'https://netaggregator.ru/img/graph/wa_180.jpg'
        }
    })

    return data */
}
