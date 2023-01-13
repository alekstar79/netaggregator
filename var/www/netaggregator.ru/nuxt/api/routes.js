import { Router } from 'express'

import main from './controllers/main'

const router = Router()

// router.delete('/ql/:id', remove)
// router.post('/ql', create)
// router.get('/ql', getAll)

router.all('/', main)

export default router
