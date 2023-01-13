/**
 * @filter         Noise
 * @description    Adds black and white noise to the image.
 * @param amount   0 to 1 (0 for no effect, 1 for maximum noise)
 */
export default `
    uniform sampler2D texture;
    uniform float amount;
    varying vec2 texCoord;
    float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }
    void main() {
        vec4 color = texture2D(texture, texCoord);
        
        float diff = (rand(texCoord) - 0.5) * amount;
        color.r += diff;
        color.g += diff;
        color.b += diff;
        
        gl_FragColor = color;
    }
`
