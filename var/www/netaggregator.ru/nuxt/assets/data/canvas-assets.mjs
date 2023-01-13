export const models = ['faceRecognitionNet','tinyFaceDetector'/*, 'faceLandmark68Net','faceExpressionNet' */]
export const draggableEvents = ['drag','dragstart','dragend','dragover','dragenter','dragleave','drop']
export const empty = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
export const drop = { url: '/img/graph/drop.svg', text: 'DROP IMAGE HERE' }
export const logo = { url: '/img/graph/logo.svg', text: 'NETAGGREGATOR' }
export const busEvents = {
    'context:on-change': 'contextOnChange',
    'canvas:reload': 'canvasFinalize',
    'paste:image': 'imgResolver',
    'edit:tmpl': 'checkRunState'
}
