/**
 * Fix for browsers, that don't provide window.devicePixelRatio
 * @see http://snippets.pro/snippet/37-get-device-pixel-ratio-dpr
 * @see https://gist.github.com/CezaryDanielNowak/9074032
 */

function mediaQuery(v)
{
  return `(-webkit-min-device-pixel-ratio: ${v}),` +
    `(min--moz-device-pixel-ratio: ${v}),` +
    `(min-resolution: ${v}dppx)`
}

/**
 * Get real pixel ratio. Page zoom is included in calculation of real pixel ratio,
 * so it's valid solution for desktops
 * @return {Object}
 */
export function getPixelRatio()
{
  const STEP = .05, MIN = .5, MAX = 5

  // * 100 is added to each constants because of JS's float handling and
  // numbers such as `4.9-0.05 = 4.8500000000000005`
  let maximumMatchingSize, isZoomed = 'unknown'
  for (let i = MAX * 100; i >= MIN * 100; i -= STEP * 100) {
    if (window.matchMedia(mediaQuery(i / 100)).matches) {
      maximumMatchingSize = i / 100
      break
    }
  }

  if (window.devicePixelRatio) {
    isZoomed = parseFloat(window.devicePixelRatio) !== parseFloat(maximumMatchingSize)
  }

  return {
    devicePixelRatio: window.devicePixelRatio,
    realPixelRatio: maximumMatchingSize,
    isZoomed
  }
}
