import entity from '../assets/data/entity.mjs'
import codes from '../assets/data/codes.mjs'

function isEmpty(str)
{
  return str === '' || /^\s+$/.test(str)
}

function swap(s, regexp, substr)
{
  let x = 0

  if (regexp.length === substr.length) {
    for (const i = regexp.length; x < i; x++) {
      s = s.replace(new RegExp(regexp[x], 'g'), substr[x])
    }
  }

  return s
}

function HTML2Numerical(s)
{
  return swap(s, entity, codes)
}

function Numerical2HTML(s)
{
  return swap(s, codes, entity)
}

function numEncode(s)
{
  const b = []

  for (let i = s.length - 1; i >= 0; i--) {
    const c = s.charAt(i)

    if (c < ' ' || c > '~') {
      b.unshift(`&#${c.charCodeAt(0)};`)
    } else {
      b.unshift(c)
    }
  }

  return b.join('')
}

export function xssEncode(s, entity = false)
{
  return entity
    ? s.replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : s.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/</g, '&#60;').replace(/>/g, '&#62;')
}

export function hasEncoded(s)
{
  return !/&#[0-9]{1,5};/g.test(s) ? /&[A-Z]{2,6};/gi.test(s) : true
}

export function decode(s)
{
  return s.replace(/&#(\d+);/gm, (m, dec) => String.fromCharCode(dec))
}

export function encode(s)
{
  const b = []

  for (let i = s.length - 1; i >= 0; i--) {
    b.unshift(`&#${s.charCodeAt(i)};`)
  }

  return b.join('')
}

export default {
  type: 'entity',

  decode(s)
  {
    if (isEmpty(s)) return ''

    let c, m, d = HTML2Numerical(s),
      arr = d.match(/&#[0-9]{1,5};/g)

    if (arr) {
      for (let x = 0; x < arr.length; x++) {
        m = arr[x]

        c = m.substring(2, m.length - 1)

        d = c >= -32768 && c <= 65535
          ? d.replace(m, String.fromCharCode(c))
          : d.replace(m, '')
      }
    }

    return d
  },
  encode(s, dbl = false)
  {
    if (isEmpty(s)) return ''

    if (dbl) {
      s = s.replace(/&/g, this.type === 'numerical' ? '&#38;' : '&amp;')
    }

    s = xssEncode(s, false)

    if (this.type === 'numerical' || !dbl) {
      s = HTML2Numerical(s)
    }

    s = numEncode(s)

    if (!dbl) {
      s = s.replace(/&#/g, '##AMPHASH##')
      s = s.replace(/&/g, this.type === 'numerical' ? '&#38;' : '&amp;')
      s = s.replace(/##AMPHASH##/g, '&#')
    }

    s = s.replace(/&#\d*([^\d;]|$)/g, '$1')

    if (!dbl) {
      s = s.replace(/(&amp;)(amp;)+/, '$1')
    }
    if (this.type === 'entity') {
      s = Numerical2HTML(s)
    }

    return s
  }
}
