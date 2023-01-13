/* https://web-animations.github.io/web-animations-demos/#waves/ */

function createBox()
{
    const box = document.createElement('div')

    box.className = 'box'
    box.style.width = (100 / sideCount) + '%'
    box.style.height = (100 / sideCount) + '%'

    container.appendChild(box)

    return box
}

container.animate({
    transform: [
        'rotateX(70deg) rotateZ(0deg)',
        'rotateX(70deg) rotateZ(360deg)'
    ],
}, {
    duration: 20000,
    iterations: Infinity,
})

const sideCount = 20
const adjustment = (sideCount % 2) * .5
const min = -sideCount / 2 + adjustment
const max = sideCount / 2 + adjustment

for (let y = min; y < max; y++) {
    for (let x = min; x < max; x++) {
        const box = createBox()

        box.animate({
            transform: ['translateZ(0px)','translateZ(40px)'],
            opacity: [1, 0]
        },{
            delay: (x * x + y * y) * 20,
            duration: 2000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in'
        })
    }
}
