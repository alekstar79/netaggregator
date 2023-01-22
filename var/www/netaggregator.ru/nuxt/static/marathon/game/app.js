const getRandomNumber = (min, max) => Math.round(Math.random() * (max - min) + min)

const screens = document.querySelectorAll('.screen')
const timeList = document.querySelector('#time-list')
const startBtn = document.querySelector('#start')
const timeEl = document.querySelector('#time')
const board = document.querySelector('#board')

let time = 0, score = 0

startBtn.addEventListener('click', (event) => {
  event.preventDefault()
  screens[0].classList.add('up')
})

timeList.addEventListener('click', event => {
  if (event.target.classList.contains('time-btn')) {
    time = parseInt(event.target.getAttribute('data-time'))
    screens[1].classList.add('up')
    startGame()
  }
})

board.addEventListener('click', event => {
  if (event.target.classList.contains('circle')) {
    score++
    event.target.remove()
    createRandomCircle()
  }
})

function startGame()
{
  setInterval(decreaseTime, 1000)
  createRandomCircle()
  setTime(time)
}

function decreaseTime()
{
  if (time === 0) {
    finishGame()

  } else {
    let current = --time

    if (current < 10) {
      current = `0${current}`
    }

    setTime(current)
  }
}

function setTime(value)
{
  timeEl.innerHTML = `00:${value}`
}

function finishGame()
{
  timeEl.parentNode.classList.add('hide')
  board.innerHTML = `<h1>Счет: <span class="primary">${score}</span></h1>`
}

function createRandomCircle()
{
  const { width, height } = board.getBoundingClientRect(),
    size = getRandomNumber(10, 60)

  const y = getRandomNumber(0, height - size)
  const x = getRandomNumber(0, width - size)
  const color = getRandomNumber(0, 360)

  const circle = document.createElement('div')

  circle.classList.add('circle')

  circle.style.backgroundColor = `hsla(${color},100%,75%,90%)`
  circle.style.height = `${size}px`
  circle.style.width = `${size}px`
  circle.style.left = `${x}px`
  circle.style.top = `${y}px`

  board.append(circle)
}
