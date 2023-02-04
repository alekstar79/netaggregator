export const extractCellId = id => id && parseInt(id.slice(5), 10)

export const getChildren = layout => Array.from(layout.children).filter(c => /cell-\d+/.test(c.id))
export const getParentId = $cell => extractCellId($cell.parentElement.parentElement.id)

export function resetLayoutsStyle()
{
  document.querySelectorAll('.Layout')
    .forEach(el => {
      el.style.backgroundColor = null
      el.style.paddingBottom = '0px'
      el.style.paddingRight = '0px'
      el.style.paddingLeft = '0px'
      el.style.paddingTop = '0px'
    })
}

export function moveCellToPlaceholderPosition(cellId, newRoot = document, prevRoot = document)
{
  const $placeholders = newRoot
    ? Array.from(newRoot.querySelectorAll('.Layout_Cell--placeholder'))
    : []

  if (!$placeholders.length) return

  const $otherPlaceholders = $placeholders.slice(1),
    $placeholder = $placeholders[0]

  $otherPlaceholders.forEach($other => $other.remove())

  const $cell = prevRoot
    ? prevRoot.querySelector(`[id='${cellId}']`)
    : null

  if (!$cell) return

  $cell.style.marginLeft = $placeholder.style.marginLeft
  $cell.style.marginTop = $placeholder.style.marginTop

  resetLayoutsStyle()

  $placeholder.parentNode.insertBefore($cell, $placeholder.nextSibling)
}

export const getPrevSiblingId = $cell => (
  $cell.previousSibling &&
  $cell.previousSibling.previousSibling &&
  extractCellId($cell.previousSibling.previousSibling.id)
)

export default {
  moveCellToPlaceholderPosition,
  resetLayoutsStyle,
  getPrevSiblingId,
  extractCellId,
  getParentId,
  getChildren
}
