/**
 * Compress image
 * @param {File} file
 * @param {Number} minHeight
 * @param {Number} minWidth
 * @param {Number} quality
 * @return {Promise<Blob>}
 */
export function compress(file, { minHeight, minWidth, quality })
{
    return import(/* webpackChunkName: "compressor" */ 'compressorjs')
        .then(m => m.default || m)
        .then(Compressor => new Promise((resolve, reject) => {
            return new Compressor(file, {
                minHeight,
                minWidth,
                quality,

                success(blob) {
                    resolve(blob)
                },
                error() {
                    reject()
                }
            })
        }))
}
