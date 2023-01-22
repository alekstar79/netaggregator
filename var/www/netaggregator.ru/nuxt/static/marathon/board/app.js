/**
 * Examples:
 * @see https://jsfiddle.net/VsevolodKo/a48fkwy1/38/
 * @see https://jsfiddle.net/etokarsky/mwfL9g8e/2/
 * @see https://jsfiddle.net/naviCom21/72jvhrby/
 * @see https://jsfiddle.net/Aleksei_Ya/6k0qd3c9/2/
 */

const colors = ['#69D2E7', '#9DE0AD', '#E0E4CC', '#FA6900', '#FE4365']
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]
const SQUARES_NUMBER = 500
const squares = []

const board = document.querySelector('#board')

function fadeEffect({ target })
{
  target.removeEventListener('mouseleave', fadeEffect)

  setTimeout(() => {
    target.style.backgroundColor = '#1d1d1d'
    target.style.boxShadow = `0 0 2px #000`
  }, 7)
}

function highlightEffect({ target })
{
  const color = getRandomColor()

  target.style.boxShadow = `0 0 2px ${color}, 0 0 10px ${color}`
  target.style.backgroundColor = color

  target.addEventListener('mouseleave', fadeEffect)
}

function onOver(e)
{
  e.target.classList.contains('square') && highlightEffect(e)
}

for (let i = 0; i < SQUARES_NUMBER; i++) {
  squares[i] = document.createElement('div')
  squares[i].classList.add('square')
}

board.addEventListener('mouseover', onOver)
board.append(...squares)
