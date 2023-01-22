const c = document.getElementById('canvas'),
    ctx = c.getContext('2d'),

    w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,

    // parameters
    total = w,
    accelleration = .05,

    // afterinitial calculations
    size = w / total,
    occupation = w / total,
    repaintColor = 'rgba(0,0,0,.04)',
    length = 10,
    colors = [],
    dots = [],
    dotsVel = []

// setting the colors' hue
// and y level for all dots
const portion = 360 / total

for (let i = 0; i < total; ++i) {
    colors[i] = portion * i
    dots[i] = h + length
    dotsVel[i] = Math.random() * 10
}

function anim()
{
    window.requestAnimationFrame(anim)

    ctx.fillStyle = repaintColor
    ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < total; ++i) {
        let currentY = dots[i] - length
        dots[i] += dotsVel[i] += accelleration

        ctx.fillStyle = `hsl(${colors[i]}, 80%, 50%)`
        ctx.fillRect(occupation * i, currentY, size, dotsVel[i] + length)

        if (dots[i] > h && Math.random() < .01) {
            dots[i] = dotsVel[i] = 0
        }
    }
}

anim()
