import { DRectangle } from './rectangle.mjs'
import { DTriangle } from './triangle.mjs'
import { DPolyline } from './polyline.mjs'
import { DEllipse } from './ellipse.mjs'
import { DImage } from './image.mjs'
import { Shape } from './shape.mjs'
import { DLine } from './line.mjs'
import { DText } from './text.mjs'

export const drawers = [DImage, DPolyline, DLine, DRectangle, DTriangle, DEllipse, DText]

export { Shape, DImage, DEllipse, DLine, DPolyline, DRectangle, DTriangle, DText }
