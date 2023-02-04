export class UbjsonDecoder {
  constructor(options = {}) {
    this._options = options
    this._textDecoder = new (typeof TextDecoder !== 'undefined'
        ? TextDecoder
        : require('util').TextDecoder // eslint-disable-line global-require
    )()
  }

  decode(buffer) {
    const array = new Uint8Array(buffer)
    const view = new DataView(array.buffer)
    this._storage = { array, view }
    this._offset = 0
    return this._decode()
  }

  _decode(type = this._readType(false)) {
    switch (type) {
      case 'Z':
        return null
      case 'N':
        return undefined
      case 'T':
        return true
      case 'F':
        return false
      case 'i':
        return this._read(({ view }, offset) => view.getInt8(offset), 1)
      case 'U':
        return this._read(({ view }, offset) => view.getUint8(offset), 1)
      case 'I':
        return this._read(({ view }, offset) => view.getInt16(offset), 2)
      case 'l':
        return this._read(({ view }, offset) => view.getInt32(offset), 4)
      case 'L':
        return this._handleUnsupported(8, this._options.int64Handling, true)
      case 'd':
        return this._read(({ view }, offset) => view.getFloat32(offset), 4)
      case 'D':
        return this._read(({ view }, offset) => view.getFloat64(offset), 8)
      case 'H':
        return this._handleUnsupported(
          this._decodeCount(),
          this._options.highPrecisionNumberHandling,
          false
        )
      case 'C':
        return String.fromCharCode(this._decode('i'))
      case 'S':
        return this._readString(this._decodeCount())
      case '[':
        return this._decodeArray()
      case '{':
        return this._decodeObject()
    }
    throw new Error('Unexpected type')
  }

  _decodeContainerMarkers() {
    let type
    let count
    switch (this._readType(true)) {
      case '$':
        this._skip()
        type = this._readType(false)
        if (this._readType(true) !== '#') {
          throw new Error('Expected count marker')
        }
      /* fall through */
      case '#':
        this._skip()
        count = this._decodeCount()
        break
    }
    return { type, count }
  }

  _decodeArray() {
    const { type, count } = this._decodeContainerMarkers()
    if ('ZTF'.includes(type)) {
      return new Array(count).fill(this._decode(type))
    }
    if (this._options.useTypedArrays) {
      switch (type) {
        case 'i':
          return this._readInt8Array(count)
        case 'U':
          return this._readUint8Array(count)
        case 'I':
          return Int16Array.from({ length: count }, () => this._decode(type))
        case 'l':
          return Int32Array.from({ length: count }, () => this._decode(type))
        case 'd':
          return Float32Array.from({ length: count }, () => this._decode(type))
        case 'D':
          return Float64Array.from({ length: count }, () => this._decode(type))
      }
    }
    if (count != null) {
      const array = new Array(count)
      for (let i = 0; i < count; i++) {
        array[i] = this._decode(type)
      }
      return array
    }
    else {
      const array = []
      while (this._readType(true) !== ']') {
        array.push(this._decode())
      }
      this._skip()
      return array
    }
  }

  _decodeObject() {
    const { type, count } = this._decodeContainerMarkers()
    const object = {}
    if (count != null) {
      for (let i = 0; i < count; i++) {
        const key = this._decode('S')
        object[key] = this._decode(type)
      }
    }
    else {
      while (this._readType(true) !== '}') {
        const key = this._decode('S')
        object[key] = this._decode()
      }
      this._skip()
    }
    return object
  }

  _decodeCount() {
    const count = this._decode()
    if (Number.isInteger(count) && count >= 0) {
      return count
    }
    throw new Error('Invalid length/count')
  }

  _handleUnsupported(byteLength, handlingBehavior, isBinary) {
    if (typeof handlingBehavior === 'function') {
      return this._read(handlingBehavior, byteLength)
    }
    switch (handlingBehavior) {
      case 'skip':
        this._skip(byteLength)
        return undefined
      case 'raw':
        return isBinary ? this._readUint8Array(byteLength) : this._readString(byteLength)
    }
    throw new Error('Unsuported type')
  }

  _readUint8Array(byteLength) {
    return this._read(
      ({ array }, offset) => new Uint8Array(array.buffer, offset, byteLength),
      byteLength
    )
  }

  _readInt8Array(byteLength) {
    return this._read(
      ({ array }, offset) => new Int8Array(array.buffer, offset, byteLength),
      byteLength
    )
  }

  _readString(byteLength) {
    return this._read(
      ({ array }, offset) =>
        this._textDecoder.decode(new DataView(array.buffer, offset, byteLength)),
      byteLength
    )
  }

  _skip(byteLength = 1) {
    this._checkRange(byteLength)
    this._offset += byteLength
  }

  _readType(lookahead) {
    const { array, view } = this._storage
    let type = 'N'
    while (type === 'N' && this._offset < array.byteLength) {
      type = String.fromCharCode(view.getInt8(this._offset++))
    }
    if (lookahead) {
      this._offset--
    }
    return type
  }

  _read(retriever, byteLength) {
    this._checkRange(byteLength)
    const value = retriever(this._storage, this._offset, byteLength)
    this._offset += byteLength
    return value
  }

  _checkRange(byteLength) {
    if (this._offset + byteLength > this._storage.array.byteLength) {
      throw new Error('Unexpected EOF')
    }
  }
}
