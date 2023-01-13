/**
 * @filter         Unsharp Mask
 * @description    A form of image sharpening that amplifies high-frequencies in the image. It
 *                 is implemented by scaling pixels away from the average of their neighbors.
 * @param radius   The blur radius that calculates the average of the neighboring pixels.
 * @param strength A scale factor where 0 is no effect and higher values cause a stronger effect.
 */
export default `
    uniform sampler2D blurredTexture;
    uniform sampler2D originalTexture;
    uniform float strength;
    uniform float threshold;
    varying vec2 texCoord;
    void main() {
        vec4 blurred = texture2D(blurredTexture, texCoord);
        vec4 original = texture2D(originalTexture, texCoord);
        gl_FragColor = mix(blurred, original, 1.0 + strength);
    }
`
