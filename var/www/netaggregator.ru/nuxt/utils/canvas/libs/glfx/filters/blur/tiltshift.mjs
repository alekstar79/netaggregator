import { randomShaderFunc } from '../common.mjs'

/**
 * @filter               Tilt Shift
 * @description          Simulates the shallow depth of field normally encountered in close-up
 *                       photography, which makes the scene seem much smaller than it actually
 *                       is. This filter assumes the scene is relatively planar, in which case
 *                       the part of the scene that is completely in focus can be described by
 *                       a line (the intersection of the focal plane and the scene). An example
 *                       of a planar scene might be looking at a road from above at a downward
 *                       angle. The image is then blurred with a blur radius that starts at zero
 *                       on the line and increases further from the line.
 * @param startX         The x coordinate of the start of the line segment.
 * @param startY         The y coordinate of the start of the line segment.
 * @param endX           The x coordinate of the end of the line segment.
 * @param endY           The y coordinate of the end of the line segment.
 * @param blurRadius     The maximum radius of the pyramid blur.
 * @param gradientRadius The distance from the line at which the maximum blur radius is reached.
 */
export default `
    uniform sampler2D texture;
    uniform float blurRadius;
    uniform float gradientRadius;
    uniform vec2 start;
    uniform vec2 end;
    uniform vec2 delta;
    uniform vec2 texSize;
    varying vec2 texCoord;
    ${randomShaderFunc}
    void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;
        
        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        
        vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));
        float radius = smoothstep(0.0, 1.0, abs(dot(texCoord * texSize - start, normal)) / gradientRadius) * blurRadius;
        
        for (float t = -30.0; t <= 30.0; t++) {
            float percent = (t + offset - 0.5) / 30.0;
            float weight = 1.0 - abs(percent);
            vec4 sample = texture2D(texture, texCoord + delta / texSize * percent * radius);
            
            sample.rgb *= sample.a;
            
            color += sample * weight;
            total += weight;
        }
        
        gl_FragColor = color / total;
        gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }
`
