const vendors = ['moz', 'webkit']

export class WowListener
{
  constructor()
  {
    this.listener = null
    this.lastTick = null
    this.items = []
    this.rate = 100
  }

  register(el, animationConfig)
  {
    // setTimeout(() => {
    if (!showElement(el, animationConfig)) {
      this.items.push({ el, animationConfig })

      if (this.listener === null) {
        this.registerListener()
      }
    }
    // })
  }

  registerListener()
  {
    this.listener = this.handleScroll.bind(this)

    window.addEventListener('scroll', this.listener)
  }

  unregisterListener()
  {
    window.removeEventListener('scroll', this.listener)

    this.listener = null
  }

  handleScroll()
  {
    let item = null, currentDate = Date.now()

    if (currentDate - this.lastTick >= this.rate) {
      this.lastTick = currentDate

      for (let i = this.items.length - 1; i >= 0; i--) {
        item = this.items[i]

        if (showElement(item.el, item.animationConfig)) {
          this.items.splice(i, 1)
        }
      }

      if (this.items.length === 0) {
        this.unregisterListener()
      }
    }
  }
}

function getCssVendor(element, propertyName)
{
  let style = getComputedStyle(element)
  let result = style.getPropertyValue(propertyName)

  if (!result) {
    for (let i = 0; i < vendors.length; i++) {
      if ((result = style.getPropertyValue(`-${vendors[i]}-${propertyName}`))) {
        return result
      }
    }
  }

  return result
}

/**
 * @param {{DOMElementNode}} el
 * @return String
 */
export function getAnimationName(el)
{
  return getCssVendor(el, 'animation-name')
}

/**
 * @param {{DOMElementNode}} el
 * @return Boolean
 */
export function isVisible(el)
{
  let rect = el.getBoundingClientRect()

  return (
    (rect.top + rect.height) >= 0 &&
    (rect.left + rect.width) >= 0 &&
    (rect.bottom - rect.height) <= ((window.innerHeight || document.documentElement.clientHeight)) &&
    (rect.right - rect.width) <= ((window.innerWidth || document.documentElement.clientWidth))
  )
}

/**
 * Trigger the animation to show the element whether is visible
 * @param {DOMElementNode} el
 * @param {Object} animationConfig
 * @return Boolean
 */
export function showElement(el, animationConfig)
{
  if (isVisible(el)) {
    for (const name in animationConfig) {
      el.style[name] = animationConfig[name]
    }

    el.style.visibility = 'visible'

    return true
  }

  return false
}
