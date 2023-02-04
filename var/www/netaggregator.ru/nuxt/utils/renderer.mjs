/**
 * @see https://github.com/kwdowik/zoom-pan
 * @see https://github.com/kwdowik/use-zoom-pan
 */
export function Renderer({ minScale, maxScale, scaleSensitivity = 10 })
{
  const getInitialState = () => ({
    minScale,
    maxScale,
    scaleSensitivity,
    transformation: {
      originX: 0,
      originY: 0,
      translateX: 0,
      translateY: 0,
      scale: 1
    }
  })

  let state = Object.assign({}, getInitialState())

  this.zoom = ({ element, x, y, deltaScale }) => {
    const { left, top } = element.getBoundingClientRect()
    const { minScale, maxScale, scaleSensitivity } = state
    const [scale, newScale] = getScale({
      scale: state.transformation.scale,
      deltaScale,
      minScale,
      maxScale,
      scaleSensitivity
    })
    const originX = x - left - window.scrollX
    const originY = y - top - window.scrollY
    const newOriginX = originX / scale
    const newOriginY = originY / scale
    const translate = getTranslate({ scale, minScale, maxScale })
    const translateX = translate({
      pos: originX,
      prevPos: state.transformation.originX,
      translate: state.transformation.translateX
    })
    const translateY = translate({
      pos: originY,
      prevPos: state.transformation.originY,
      translate: state.transformation.translateY
    })

    element.style.transformOrigin = `${newOriginX}px ${newOriginY}px`
    element.style.transform = getMatrix({
      scale: newScale,
      translateX,
      translateY
    })
    state.transformation = {
      originX: newOriginX,
      originY: newOriginY,
      translateX,
      translateY,
      scale: newScale
    }
  }
  this.panBy = ({ element, originX, originY }) => {
    pan({ element, state, originX, originY });
  }
  this.panTo = ({ element, originX, originY, scale }) => {
    if (scale) state.transformation.scale = scale

    pan({
      element,
      state,
      originX: originX - state.transformation.translateX,
      originY: originY - state.transformation.translateY
    })
  }
  this.reset = () => {
    state = Object.assign({}, getInitialState())
  }

  const hasPositionChanged = ({ pos, prevPos }) => pos !== prevPos

  const valueInRange = ({ minScale, maxScale, scale }) =>
    scale <= maxScale && scale >= minScale;

  const getTranslate = ({ minScale, maxScale, scale }) => ({ pos, prevPos, translate }) =>
    valueInRange({ minScale, maxScale, scale }) &&
    hasPositionChanged({ pos, prevPos })
      ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
      : translate

  const getScale = ({ scale, minScale, maxScale, scaleSensitivity, deltaScale }) => {
    let newScale = scale + deltaScale / (scaleSensitivity / scale)
    newScale = Math.max(minScale, Math.min(newScale, maxScale))

    return [scale, newScale]
  }

  const getMatrix = ({ scale, translateX, translateY }) =>
    `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`

  const pan = ({ element, state, originX, originY }) => {
    state.transformation.translateX += originX
    state.transformation.translateY += originY
    element.style.transform = getMatrix({
      scale: state.transformation.scale,
      translateX: state.transformation.translateX,
      translateY: state.transformation.translateY
    })
  }
}

export function useZoomPan({ element, minScale = .1, maxScale = 30, scaleSensitivity = 50 })
{
  const renderer = new Renderer({ minScale, maxScale, element, scaleSensitivity })

  const zoom = event => {
    renderer.zoom({
      element,
      deltaScale: Math.sign(event.deltaY) > 0 ? -1 : 1,
      x: event.pageX,
      y: event.pageY
    })
  }

  const panBy = event => {
    renderer.panBy({
      element,
      originX: event.movementX,
      originY: event.movementY
    })
  }

  const panTo = ({ x, y, scale }) => {
    renderer.panTo({
      element,
      originX: x,
      originY: y,
      scale
    })
  }

  return { zoom, panBy, panTo }
}

export function whichBtn(e, which = 1)
{
  if (!e.which && e.button) {
    switch (true) {
      case !!(e.button & 1):  // left
        e.which = 1
        break
      case !!(e.button & 4):  // midd
        e.which = 2
        break
      case !!(e.button & 2):  // right
        e.which = 3
        break
    }
  }

  return e.which === which
}

export function zoomPan(element)
{
  const { zoom, panBy } = useZoomPan({ element })

  element.addEventListener('wheel', mousewheel, { passive: false })
  element.addEventListener('mousedown', mousedown)

  function discard() {
    element.removeEventListener('wheel', mousewheel, { passive: false })
    element.removeEventListener('mousedown', mousedown)
  }

  function mousewheel(e) {
    if (!e.ctrlKey) return

    e.preventDefault()

    zoom(e)
  }

  function mousemove(e) {
    if (!e.shiftKey) return

    e.preventDefault()

    panBy(e)
  }

  function mouseup() {
    element.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }

  function mousedown(e) {
    if (!whichBtn(e)) return

    element.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }

  return discard
}
