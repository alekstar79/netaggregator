let Observer

export async function loadFont({ fontFamily }, timeout = 3000)
{
    try {

        if (!fontFamily) return

        Observer || ({ default: Observer } = await import(/* webpackChunkName: "font-observer" */ 'fontfaceobserver'))

        await (new Observer(fontFamily)).load(null, timeout)

    } catch (e) {
    }
}
