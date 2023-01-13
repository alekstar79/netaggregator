let c = document.getElementById('canvas'),
    ctx = c.getContext('2d'),

    { max, pow, sqrt, sin, cos, PI } = Math,

    w, h,

    k = {
        8:  .016,
        9:  .022,
        10: .026,
        11: .03,
        12: .036,
        13: .038,
        14: .042,
        15: .046,
        16: .048,
        17: .05,
        18: .054,
        19: .058,
        20: .06,
        21: .064,
        22: .068,
        23: .072,
        24: .074,
        25: .078,
        26: .08,
        27: .082,
        28: .084,
        29: .086,
        30: .088,
        31: .09,
        32: .094,
        33: .096,
        34: .098,
        35: .099,
        36: .1
    },

    /*
    * spiral vars
    * @see https://twitter.com/jackrugile/status/420459385505079296
    */
    n = 4  /* shades default 8 */,
    m = 2  /* shade repetitions default 4 */,
    p = 26 /* dots on each branch default 32 */,
    t = 0,
    r,
    beta /* branch specific */,
    gamma /* dot specific */,

    x0, y0,
    x1, y1,

    hue,
    t_step = 1 / 60,
    requestID

const z = (2 * sqrt(p) / p) + k[p]

const spiral = function() {
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = '#2b2b2b'
    ctx.fillRect(0, 0, w, h)

    for (let i = 0; i < n * m; i++) {
        beta = i * 2 * PI / (n * m)
        x0 = 0

        /* Begin the path up here */
        ctx.beginPath()
        hue = i * 360 / n
        ctx.translate(w / 2, h / 2)
        ctx.rotate(t / 3)

        /* only need to set the fillstyle once up here now */
        ctx.fillStyle = `hsl(${hue}, 100%, 65%)`

        for (let j = 0; j < p; j++) {
            gamma = j * 2 * PI / p
            // r = max(1, pow(2 * (j * (p - j)), .43) - 10)
            r = max(1, pow(2 * (j * (p - j)), z) - 10)

            x0 += 3.4 * r
            y0 = x0 * sin(gamma + 2 * t + x0 / 99) / 5

            /* change of coordinates */
            x1 = x0 * cos(beta) - y0 * sin(beta)
            y1 = x0 * sin(beta) + y0 * cos(beta)

            /*
            * move it to the position of the arc
            * remove this for a cool effect ;)
            */
            ctx.moveTo(x1, y1)

            /* setup the arc path here */
            ctx.arc(x1, y1, r, 0, 2 * PI)
        }

        /* close the 1 path that now is a combination of all the arcs */
        ctx.closePath()

        /* fill the whole path only once now */
        ctx.fill()

        /*
        * reason for moving the fill out of the inner loop:
        * see https://twitter.com/loktar00/status/420369245378076672
        */
        ctx.rotate(-t / 3)
        ctx.translate(-w / 2, -h / 2)
    }

    t += t_step

    requestID = window.requestAnimationFrame(spiral)
}

const initCanvas = function() {
    h = c.height = window.innerHeight
    w = c.width = window.innerWidth

    /*
    * if resizing, make sure to stop the previous animation
    * before starting a new one
    *
    * cancelAnimationFrame(requestID) should be
    * the requestID returned by requestAnimationFrame
    * thanks @FWeinb!
    */
    if (requestID) {
        window.cancelAnimationFrame(requestID)
    }

    spiral()
}

window.addEventListener('resize', initCanvas, false)

window.onload = initCanvas
