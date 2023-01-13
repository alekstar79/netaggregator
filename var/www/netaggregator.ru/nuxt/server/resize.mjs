// For doing image resizing on the fly
// noinspection JSValidateJSDoc

import sharp from 'sharp'

/**
 * @param {NodeJS.ReadWriteStream} stream
 * @param {Number} width
 * @param {Number} height
 * @return {NodeJS.ReadWriteStream}
 */
export function resize(stream, width = 960, height = 380)
{
  let transform = /** @type {NodeJS.WritableStream|Sharp} */sharp()

  try {

    if (width || height) {
      transform = transform.resize({
        fit: sharp.fit.contain,
        position: 'right bottom',
        height,
        width
      })
    }

  } catch (e) {
    return /** @type NodeJS.ReadWriteStream */stream
  }

  return /** @type NodeJS.ReadWriteStream */stream.pipe(transform)
}
