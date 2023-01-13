import { randomShaderFunc } from '../common.mjs'

const common = `
    uniform sampler2D texture0;
    uniform sampler2D texture1;
    uniform vec2 delta0;
    uniform vec2 delta1;
    uniform float power;
    varying vec2 texCoord;
    ${randomShaderFunc}
    vec4 sample(vec2 delta) {
        float offset = random(vec3(delta, 151.7182), 0.0);
        vec4 color = vec4(0.0);
        float total = 0.0;
        
        for (float t = 0.0; t <= 30.0; t++) {
            float percent = (t + offset) / 30.0;
            color += texture2D(texture0, texCoord + delta * percent);
            total += 1.0;
        }
        
        return color / total;
    }
`

/**
 * @filter           Lens Blur
 * @description      Imitates a camera capturing the image out of focus by using a blur that generates
 *                   the large shapes known as bokeh. The polygonal shape of real bokeh is due to the
 *                   blades of the aperture diaphragm when it isn't fully open. This blur renders
 *                   bokeh from a 6-bladed diaphragm because the computation is more efficient. It
 *                   can be separated into three rhombi, each of which is just a skewed box blur.
 *                   This filter makes use of the floating point texture WebGL extension to implement
 *                   the brightness parameter, so there will be severe visual artifacts if brightness
 *                   is non-zero and the floating point texture extension is not available. The
 *                   idea was from John White's SIGGRAPH 2011 talk but this effect has an additional
 *                   brightness parameter that fakes what would otherwise come from a HDR source.
 * @param radius     the radius of the hexagonal disk convolved with the image
 * @param brightness -1 to 1 (the brightness of the bokeh, negative values will create dark bokeh)
 * @param angle      the rotation of the bokeh in radians
 */
export const lensBlurPrePass = `
    uniform sampler2D texture;
    uniform float power;
    varying vec2 texCoord;
    void main() {
        vec4 color = texture2D(texture, texCoord);
        color = pow(color, vec4(power));
        gl_FragColor = vec4(color);
    }
`

export const lensBlur0 = common + `
    void main() {
        gl_FragColor = sample(delta0);
    }
`

export const lensBlur1 = common + `
    void main() {
        gl_FragColor = (sample(delta0) + sample(delta1)) * 0.5;
    }
`

export const lensBlur2 = common + `
    void main() {
        vec4 color = (sample(delta0) + 2.0 * texture2D(texture1, texCoord)) / 3.0;
        gl_FragColor = pow(color, vec4(power));
    }
`
