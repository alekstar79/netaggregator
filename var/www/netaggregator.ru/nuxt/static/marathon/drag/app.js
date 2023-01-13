const placeholders = document.querySelectorAll('.placeholder'),
    item = document.querySelector('.item')

let elemBelow = null, belowDroppable = null, currentDroppable = null

item.addEventListener('mousedown', e => {
    let shiftX = e.clientX - item.getBoundingClientRect().left
    let shiftY = e.clientY - item.getBoundingClientRect().top

    item.classList.add('hold')

    // item.style.position = 'absolute'
    // item.style.zIndex = 999
    // document.body.append(item)

    moveAt(e.pageX, e.pageY)

    document.addEventListener('mousemove', onMouseMove)

    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove)
        item.onmouseup = null

        if (currentDroppable) {
            currentDroppable.append(item)
        }

        item.classList.remove('hold')
    })

    function moveAt(pageX, pageY) {
        item.style.left = pageX - shiftX + 'px'
        item.style.top = pageY - shiftY + 'px'
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY)

        item.hidden = true
        elemBelow = document.elementFromPoint(event.clientX, event.clientY)
        item.hidden = false

        if (!elemBelow) return

        belowDroppable = elemBelow.closest('.placeholder')
        if (currentDroppable !== belowDroppable) {
            if (currentDroppable) {
                leaveDroppable(currentDroppable)
            }

            currentDroppable = belowDroppable

            if (currentDroppable) {
                enterDroppable(currentDroppable)
            }
        }
    }

    function enterDroppable(elem) {
        elem.classList.add('hovered')
    }

    function leaveDroppable(elem) {
        elem.classList.remove('hovered')
    }
})

item.addEventListener('dragstart', e => {
    e.preventDefault()
})

// item.addEventListener('dragstart', dragstart)
// item.addEventListener('dragend', dragend)

/* for (const placeholder of placeholders) {
    placeholder.addEventListener('dragover', dragover)
    placeholder.addEventListener('dragenter', dragenter)
    placeholder.addEventListener('dragleave', dragleave)
    placeholder.addEventListener('drop', dragdrop)
} */

/* function dragstart(event) {
    event.target.classList.add('hold')

    setTimeout(() => {
        event.target.classList.add('hide')
    })
} */

/* function dragend(event) {
    event.target.className = 'item'
} */

/* function dragover(event) {
    event.dataTransfer.dropEffect = 'copy'
    event.preventDefault()
}

function dragenter(event) {
    event.target.classList.add('hovered')
    console.log('dragenter')
}

function dragleave(event) {
    event.target.classList.remove('hovered')
    console.log('dragend')
}

function dragdrop(event) {
    event.target.classList.remove('hovered')
    event.target.append(item)
} */
