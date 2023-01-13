import { warpShader } from '../common.mjs'

/**
 * @filter                Matrix Warp
 * @description           Transforms an image by a 2x2 or 3x3 matrix. The coordinates used in
 *                        the transformation are (x, y) for a 2x2 matrix or (x, y, 1) for a
 *                        3x3 matrix, where x and y are in units of pixels.
 * @param matrix          A 2x2 or 3x3 matrix represented as either a list or a list of lists.
 *                        For example, the 3x3 matrix [[2,0,0],[0,3,0],[0,0,1]] can also be
 *                        represented as [2,0,0,0,3,0,0,0,1] or just [2,0,0,3].
 * @param inverse         A boolean value that, when true, applies the inverse transformation
 *                        instead. (optional, defaults to false)
 * @param useTextureSpace A boolean value that, when true, uses texture-space coordinates
 *                        instead of screen-space coordinates. Texture-space coordinates range
 *                        from -1 to 1 instead of 0 to width - 1 or height - 1, and are easier
 *                        to use for simple operations like flipping and rotating.
 */
export default warpShader(`
    uniform mat3 matrix;
    uniform bool useTextureSpace;
`, `
    if (useTextureSpace) coord = coord / texSize * 2.0 - 1.0;
    vec3 warp = matrix * vec3(coord, 1.0);
    coord = warp.xy / warp.z;
    if (useTextureSpace) coord = (coord * 0.5 + 0.5) * texSize;
`)
