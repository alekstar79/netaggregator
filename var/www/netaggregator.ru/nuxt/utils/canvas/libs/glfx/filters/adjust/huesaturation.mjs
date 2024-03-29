/**
 * @filter           Hue / Saturation
 * @description      Provides rotational hue and multiplicative saturation control. RGB color space
 *                   can be imagined as a cube where the axes are the red, green, and blue color
 *                   values. Hue changing works by rotating the color vector around the grayscale
 *                   line, which is the straight line from black (0, 0, 0) to white (1, 1, 1).
 *                   Saturation is implemented by scaling all color channel values either toward
 *                   or away from the average color channel value.
 * @param hue        -1 to 1 (-1 is 180 degree rotation in the negative direction, 0 is no change,
 *                   and 1 is 180 degree rotation in the positive direction)
 * @param saturation -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */
export default `
    uniform sampler2D texture;
    uniform float hue;
    uniform float saturation;
    varying vec2 texCoord;
    void main() {
        vec4 color = texture2D(texture, texCoord);
        
        float angle = hue * 3.14159265;
        float s = sin(angle), c = cos(angle);
        vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
        float len = length(color.rgb);
        color.rgb = vec3(
            dot(color.rgb, weights.xyz),
            dot(color.rgb, weights.zxy),
            dot(color.rgb, weights.yzx)
        );
        
        float average = (color.r + color.g + color.b) / 3.0;
        if (saturation > 0.0) {
            color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));
        } else {
            color.rgb += (average - color.rgb) * (-saturation);
        }
        
        gl_FragColor = color;
    }
`
