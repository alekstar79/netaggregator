import { randomShaderFunc } from '../common.mjs'

/**
 * @filter       Triangle Blur
 * @description  This is the most basic blur filter, which convolves the image with a
 *               pyramid filter. The pyramid filter is separable and is applied as two
 *               perpendicular triangle filters.
 * @param radius The radius of the pyramid convolved with the image.
 */
export default `
    uniform sampler2D texture;
    uniform vec2 delta;
    varying vec2 texCoord;
    ${randomShaderFunc}
    void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;

        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        
        for (float t = -30.0; t <= 30.0; t++) {
            float percent = (t + offset - 0.5) / 30.0;
            float weight = 1.0 - abs(percent);
            vec4 sample = texture2D(texture, texCoord + delta * percent);

            sample.rgb *= sample.a;
            
            color += sample * weight;
            total += weight;
        }
        
        gl_FragColor = color / total;
        gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }
`
