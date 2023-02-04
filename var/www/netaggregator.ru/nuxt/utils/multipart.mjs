/**
 * Multipart parse decodes a multipart/form-data encoded response into a named-part-map.
 * The response can be a string or raw bytes.
 *
 * Usage for string response:
 *     let map = parse(xhr.responseText, xhr.getResponseHeader('Content-Type'))
 *
 * Usage for raw bytes:
 *     xhr.open(..)
 *     xhr.responseType = "arraybuffer"
 *     ...
 *     let map = parse(xhr.response, xhr.getResponseHeader('Content-Type'))
 *
 * @see http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
 * @see http://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
 *
 * @copyright 2013-2014 Wolfgang Kuehn, released under the MIT license.
 * @source https://stackoverflow.com/a/21634944
 */
export function parse(body, contentType)
{
  let isRaw = typeof body !== 'string', boundary, m, s

  if (!(m = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i))) {
    throw new Error('Bad content-type header, no multipart boundary')
  }

  // \r\n is part of the boundary
  boundary = '\r\n--' + (m[1] || m[2])

  s = isRaw ? String.fromCharCode.apply(null, new Uint8Array(body)) : body

  // Prepend what has been stripped by the body parsing mechanism
  s = '\r\n' + s

  let parts = s.split(new RegExp(boundary)),
    partsByName = {},
    subparts,
    headers

  // First part is a preamble, last part is closing '--'
  for (let i = 1; i < parts.length - 1; i++) {
    subparts = parts[i].split('\r\n\r\n')
    headers = subparts[0].split('\r\n')

    let headerFields, fieldName = ''
    for (let j = 1; j < headers.length; j++) {
      headerFields = headerParse(headers[j])

      if (headerFields.name) {
        fieldName = headerFields.name
      }
    }

    partsByName[fieldName] = isRaw
      ? str2ab(subparts[1])
      : subparts[1]
  }

  return partsByName
}

export function ab2str(buf)
{
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

export function str2ab(str)
{
  const buf = new ArrayBuffer(str.length * 2),
    bufView = new Uint16Array(buf)

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i) & 0xFF
  }

  return buf
}

export function headerParse(header)
{
  const matchResult = header.match(/^.*name="([^"]*)"$/),
    headerFields = {}

  if (matchResult) {
    headerFields.name = matchResult[1]
  }

  return headerFields
}

/**
 * @see https://github.com/maurobraggio/multipart-form-parser
 * @param {String} header
 * @return {String}
 */
export function getBoundary(header)
{
  const items = header.split(';').map(Function.prototype.call, String.prototype.trim),
    boundaries = items.filter(item => item.includes('boundary'))

  if (boundaries.length === 0) {
    return ''
  }

  return parseAssignment(boundaries[0]).boundary
}

function parseAssignment(str)
{
  const assignmentParts = str.split('='),
    result = {}

  if (assignmentParts.length === 2) {
    const fieldName = assignmentParts[0].trim(),
      fieldValue = assignmentParts[1].trim()

    try {
      result[fieldName] = JSON.parse(fieldValue)
    } catch (error) {
      result[fieldName] = fieldValue
    }
  }

  return result
}

/**
 * @see https://gist.github.com/faisalman/4213592
 */
export const converter = (function() {
  const baseConverter = (from, to) => num => parseInt(num, from).toString(to)

  // binary to decimal
  baseConverter.bin2dec = baseConverter(2, 10)

  // binary to hexadecimal
  baseConverter.bin2hex = baseConverter(2, 16)

  // decimal to binary
  baseConverter.dec2bin = baseConverter(10, 2)

  // decimal to hexadecimal
  baseConverter.dec2hex = baseConverter(10, 16)

  // hexadecimal to binary
  baseConverter.hex2bin = baseConverter(16, 2)

  // hexadecimal to decimal
  baseConverter.hex2dec = baseConverter(16, 10)

  return baseConverter

})()
