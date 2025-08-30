
import { authAccessMiddleware } from '../middlewares/auth'
import { Hono } from 'hono'
import { getFilmsParserById } from '../services/parsers/getParserJson'

const parsersRoutes = new Hono()

parsersRoutes.get('/id/:id', authAccessMiddleware ,async c => {
    const { id } = c.req.param()
    const result = await getFilmsParserById(c, id)
    return c.json(result)

})

export default parsersRoutes    
