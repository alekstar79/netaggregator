import { warpShader } from '../common.mjs'

/**
 * @filter         Bulge / Pinch
 * @description    Bulges or pinches the image in a circle.
 * @param centerX  The x coordinate of the center of the circle of effect.
 * @param centerY  The y coordinate of the center of the circle of effect.
 * @param radius   The radius of the circle of effect.
 * @param strength -1 to 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
 */
export default warpShader(`
    uniform float radius;
    uniform float strength;
    uniform vec2 center;
`, `
    coord -= center;
    float distance = length(coord);
    
    if (distance < radius) {
        float percent = distance / radius;
        
        if (strength > 0.0) {
            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
        } else {
            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
        }
    }
    
    coord += center;
`)
