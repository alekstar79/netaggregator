import { randomShaderFunc } from '../common.mjs'

/**
 * @filter         Zoom Blur
 * @description    Blurs the image away from a certain point, which looks like radial motion blur.
 * @param centerX  The x coordinate of the blur origin.
 * @param centerY  The y coordinate of the blur origin.
 * @param strength The strength of the blur. Values in the range 0 to 1 are usually sufficient,
 *                 where 0 doesn't change the image and 1 creates a highly blurred image.
 */
export default `
    uniform sampler2D texture;
    uniform vec2 center;
    uniform float strength;
    uniform vec2 texSize;
    varying vec2 texCoord;
    ${randomShaderFunc}
    void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;
        vec2 toCenter = center - texCoord * texSize;

        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        
        for (float t = 0.0; t <= 40.0; t++) {
            float percent = (t + offset) / 40.0;
            float weight = 4.0 * (percent - percent * percent);
            vec4 sample = texture2D(texture, texCoord + toCenter * percent * strength / texSize);

            sample.rgb *= sample.a;
            
            color += sample * weight;
            total += weight;
        }
        
        gl_FragColor = color / total;
        gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }
`
