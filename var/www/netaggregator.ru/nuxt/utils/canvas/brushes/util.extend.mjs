export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(brushesUtils)

export function brushesUtils({ fabric })
{
    fabric.Point.prototype.normalize = function(thickness) {
        if (thickness === null || undefined === thickness) {
            thickness = 1
        }

        const length = this.distanceFrom({ x: 0, y: 0 })

        if (length > 0) {
            this.x = this.x / length * thickness
            this.y = this.y / length * thickness
        }

        return this
    }

    fabric.Point.prototype.angleBetween = function(that) {
        return Math.atan2(this.x - that.x, this.y - that.y)
    }

    fabric.util.getRandom = function(max = 1, min = 0) {
        return Math.random() * (max - min) + min
    }

    fabric.util.clamp = function(n, max = 1, min = 0) {
        return n > max ? max : n < min ? min : n
    }

    return fabric
}
