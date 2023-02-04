import modeInfo from '~/assets/data/code-mimes'

export function findModeByMIME(mime)
{
  if (!mime) return {}

  mime = mime.toLowerCase()

  for (let i = 0; i < modeInfo.length; i++) {
    let info = modeInfo[i]

    if (info.mime === mime) {
      return info
    }
    if (info.mimes) {
      for (let j = 0; j < info.mimes.length; j++) {
        if (info.mimes[j] === mime) {
          return info
        }
      }
    }
  }

  if (/\+xml$/.test(mime)) {
    return findModeByMIME('application/xml')
  }
  if (/\+json$/.test(mime)) {
    return findModeByMIME('application/json')
  }

  return {}
}

export function findModeByExtension(ext)
{
  if (!ext) return {}

  for (let i = 0; i < modeInfo.length; i++) {
    let info = modeInfo[i]

    if (info.ext) {
      for (let j = 0; j < info.ext.length; j++) {
        if (info.ext[j] === ext) {
          return info
        }
      }
    }
  }

  return {}
}

export function findModeByFileName(filename)
{
  if (!filename) return {}

  for (let i = 0; i < modeInfo.length; i++) {
    let info = modeInfo[i]

    if (info.file && info.file.test(filename)) {
      return info
    }
  }

  let dot = filename.lastIndexOf('.'),
    ext = dot > -1 && filename.substring(dot + 1, filename.length)

  return ext ? findModeByExtension(ext) : {}
}

export function findModeByName(name)
{
  if (!name) return {}

  name = name.toLowerCase()

  for (let i = 0; i < modeInfo.length; i++) {
    let info = modeInfo[i]

    if (info.name.toLowerCase() === name) {
      return info
    }
    if (info.alias) {
      for (let j = 0; j < info.alias.length; j++) {
        if (info.alias[j].toLowerCase() === name) {
          return info
        }
      }
    }
  }

  return {}
}

export default {
  ByMIME: findModeByMIME,
  ByExtension: findModeByExtension,
  ByFileName: findModeByFileName,
  ByName: findModeByName
}
