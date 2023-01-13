let active = document.querySelector('.slide.active')

document.querySelector('.container')
    .addEventListener('click', ({ target }) => {
        if (!target.classList.contains('slide')) return

        active && active.classList.remove('active')
        target.classList.add('active')
        active = target
    })
