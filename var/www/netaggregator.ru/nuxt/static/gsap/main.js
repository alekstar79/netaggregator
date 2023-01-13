/**
 * @see https://greensock.com
 * @see https://codepen.io/alekstar79/pen/XWXZrbK?editors=0110
 */

const c = document.getElementById('container'),
  boxes = [],
  max = 1,
  min = 0

let progress = 0

;(function makeBoxes(n) {
  for (let i = 0; i < n; i++) {
    const b = document.createElement('div')

    c.appendChild(b)
    boxes.push(b)
  }
})(30)

function lap(progress)
{
  for (let i = 0; i < boxes.length; i++) {
    gsap.set(boxes[i].tl, { progress })
  }
}

gsap.to(c, { perspective: 300, backgroundColor: 'transparent' })

for (let i = 0; i < boxes.length; i++) {
  let b = boxes[i]

  gsap.set(b, {
    left: '50%',
    top: '50%',
    margin: -150,
    width: 300,
    height: 300,
    borderRadius: '7%',
    backgroundImage: `url(https://picsum.photos/300/?image=${i + 50}`,
    clearProps: 'transform',
    backfaceVisibility: 'hidden'
  })

  b.tl = gsap.timeline({ paused: true, defaults: { immediateRender: true } })
    .fromTo(b, {
      scale: .5,
      rotationY: i / boxes.length * 360,
      transformOrigin: '50% 50% -800%'
    },{
      rotationY: '+=360',
      ease: 'none'
    })
    .timeScale(.05)

  b.addEventListener('click', e => {
    window.open(e.currentTarget.style.backgroundImage.slice(5, -2), '_blank')
  })
}

c.addEventListener('wheel', e => {
  const dy = e.deltaY || e.wheelDelta

  if (dy === 0) return

  progress += dy > 0 ? +.02 : -.02

  switch (true) {
    case progress >= max:
      progress = min
      break
    case progress <= min:
      progress = max
  }

  lap(progress)
})

/* ScrollTrigger.create({
    trigger: '#scrollDist',
    start: 'top',
    end: 'bottom',
    onRefresh: self => { boxes.forEach(b => { gsap.set(b.tl, { progress: self.progress }) }) },
    onUpdate: self => { boxes.forEach(b => { gsap.to(b.tl, { progress: self.progress }) }) }
}) */
