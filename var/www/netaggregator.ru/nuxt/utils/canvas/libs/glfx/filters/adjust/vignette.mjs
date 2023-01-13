/**
 * @filter         Vignette
 * @description    Adds a simulated lens edge darkening effect.
 * @param size     0 to 1 (0 for center of frame, 1 for edge of frame)
 * @param amount   0 to 1 (0 for no effect, 1 for maximum lens darkening)
 */
export default `
    uniform sampler2D texture;
    uniform float size;
    uniform float amount;
    varying vec2 texCoord;
    void main() {
        vec4 color = texture2D(texture, texCoord);
        
        float dist = distance(texCoord, vec2(0.5, 0.5));
        color.rgb *= smoothstep(0.8, size * 0.799, dist * (amount + size));
        
        gl_FragColor = color;
    }
`
