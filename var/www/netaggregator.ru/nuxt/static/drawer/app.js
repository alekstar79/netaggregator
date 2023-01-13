const navigation = document.querySelector('.navigation')
const container = document.querySelector('.container')

document.querySelector('.toggle').onclick = function() {
    navigation.classList.toggle('active')
    this.classList.toggle('active')
}

function check(el, target)
{
    if (!el.classList.contains(target)) {
        return !!el.parentElement && check(el.parentElement, target)
    }

    return true
}

/**
 * @see https://learn.javascript.ru/mouse-drag-and-drop
 * @param event
 * @return {boolean}
 */
container.onmousedown = e => {
    if (!check(e.target, 'drag-header')) return false

    const shiftX = e.clientX - container.getBoundingClientRect().left
    const shiftY = e.clientY - container.getBoundingClientRect().top

    moveAt(e.pageX, e.pageY)

    function moveAt(pageX, pageY) {
        container.style.left = pageX - shiftX + 'px'
        container.style.top = pageY - shiftY + 'px'
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY)
    }

    document.addEventListener('mousemove', onMouseMove)

    container.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove)
        container.onmouseup = null
    }
}

container.ondragstart = () => false
