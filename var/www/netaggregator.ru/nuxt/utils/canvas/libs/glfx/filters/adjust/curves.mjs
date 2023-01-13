/**
 * @filter      Curves
 * @description A powerful mapping tool that transforms the colors in the image
 *              by an arbitrary function. The function is interpolated between
 *              a set of 2D points using splines. The curves filter can take
 *              either one or three arguments which will apply the mapping to
 *              either luminance or RGB values, respectively.
 * @param red   A list of points that define the function for the red channel.
 *              Each point is a list of two values: the value before the mapping
 *              and the value after the mapping, both in the range 0 to 1. For
 *              example, [[0,1], [1,0]] would invert the red channel while
 *              [[0,0], [1,1]] would leave the red channel unchanged. If green
 *              and blue are omitted then this argument also applies to the
 *              green and blue channels.
 * @param green (optional) A list of points that define the function for the green
 *              channel (just like for red).
 * @param blue  (optional) A list of points that define the function for the blue
 *              channel (just like for red).
 */
export default `
    uniform sampler2D texture;
    uniform sampler2D map;
    varying vec2 texCoord;
    void main() {
        vec4 color = texture2D(texture, texCoord);
        color.r = texture2D(map, vec2(color.r)).r;
        color.g = texture2D(map, vec2(color.g)).g;
        color.b = texture2D(map, vec2(color.b)).b;
        gl_FragColor = color;
    }
`
