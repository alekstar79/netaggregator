/**
 * @param {Object} object
 * @return {Promise<unknown>}
 */
export function createImage(object)
{
    return import('../canvas/import.mjs')
        .then(({ Fabric }) => Fabric.resolve())
        .then(f => new Promise(resolve => {
            object.clone(clone => {
                const { x, y } = object.getPointByOrigin('left', 'top'),
                    src = clone.set({ angle: 0 }).toDataURL()

                f.Image.fromURL(src, img => {
                    img.set({
                        angle: object.angle,
                        originX: 'left',
                        originY: 'top',
                        left: x,
                        top: y
                    })

                    resolve(img)
                })
            })
        }))
}
