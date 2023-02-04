import cloneDeep from 'lodash/cloneDeep'

export const setIds = (raw, startAt = 0) => {
  function _setIds(config) {
    if (!config) return

    config.id = startAt
    startAt += 1

    if (!config.children) return

    config.children.forEach(c => {
      _setIds(c)
    })
  }

  return _setIds(raw)
}

export const removeIds = raw => {
  function _removeIds(config) {
    if (!config) return

    delete config.id

    if (!config.children) return

    config.children.forEach(el => {
      _removeIds(el)
    })
  }

  return _removeIds(raw)
}

export const findCell = (config, id) => {
  if (id !== 0 && config && config.children) {
    return config.children.find(child => child.id === id)
  }

  return null
}

export const removeCell = (config, id) => {
  if (id !== 0 && config && config.children) {
    config.children = config.children.filter(child => child.id !== id)
  }
}

export const addCell = (config, cell, parentId, prevSiblingId) => {
  if (config && config.id === parentId) {
    if (prevSiblingId) {
      const prevSiblingIndex = config.children.findIndex(
        child => child && child.id === prevSiblingId
      )

      config.children = [
        ...config.children.slice(0, prevSiblingIndex + 1),
        cell,
        ...config.children.slice(prevSiblingIndex + 1)
      ].filter(child => child)
    } else {
      config.children = [cell, ...config.children].filter(child => child)
    }

    return
  }

  if (config && config.children) {
    config.children.forEach(child => {
      addCell(child, cell, parentId, prevSiblingId)
    })
  }
}

export const moveElementToNewLayout = (
  cellConfig,
  prevParentLayoutJson,
  nextParentLayoutJson,
  cellId,
  parentId,
  prevSiblingId
) => {

  const newPrevParentLayoutJson = cloneDeep(prevParentLayoutJson),
    newNextParentLayoutJson = cloneDeep(nextParentLayoutJson)

  removeCell(newPrevParentLayoutJson, cellId)
  addCell(newNextParentLayoutJson, cellConfig, parentId, prevSiblingId)

  return { newPrevParentLayoutJson, newNextParentLayoutJson }
}

export const moveElementToNewPositionInLayout = (
  cellConfig,
  prevParentLayoutJson,
  cellId,
  parentId,
  prevSiblingId
) => {

  const newPrevParentLayoutJson = cloneDeep(prevParentLayoutJson)

  removeCell(newPrevParentLayoutJson, cellId)
  addCell(newPrevParentLayoutJson, cellConfig, parentId, prevSiblingId)

  return { newPrevParentLayoutJson, newNextParentLayoutJson: null }
}

export const moveElementToNewPosition = (
  cellConfig,
  prevParentLayoutJson,
  nextParentLayoutJson,
  cellId,
  parentId,
  prevParentId,
  prevSiblingId
) => {

  let newPrevParentLayoutJson, newNextParentLayoutJson

  if (parentId !== prevParentId) {
    ;({
      newPrevParentLayoutJson,
      newNextParentLayoutJson
    } = moveElementToNewLayout(
      cellConfig,
      prevParentLayoutJson,
      nextParentLayoutJson,
      cellId,
      parentId,
      prevSiblingId
    ))
  } else {
    ;({
      newPrevParentLayoutJson,
      newNextParentLayoutJson
    } = moveElementToNewPositionInLayout(
      cellConfig,
      prevParentLayoutJson,
      cellId,
      parentId,
      prevSiblingId
    ))
  }

  return { newPrevParentLayoutJson, newNextParentLayoutJson }
}

export default {
  moveElementToNewPositionInLayout,
  moveElementToNewPosition,
  moveElementToNewLayout,
  removeCell,
  removeIds,
  addCell,
  setIds
}
