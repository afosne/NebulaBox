import { Hono } from 'hono'
import { getFilmsDetailByName } from '../services/films/getFilmsDetailByName'
import { authAccessMiddleware } from '../middlewares/auth'
import { getFilmsDetailById } from '../services/films/getFilmsDetail'

const filmRoutes = new Hono()

filmRoutes.get('/id/:id', authAccessMiddleware ,async c => {
    const { id } = c.req.param()
    const films = await getFilmsDetailById(c, id)
    return c.json(films)

})

filmRoutes.get('/name/:name', authAccessMiddleware, async c => {
    const { name } = c.req.param()
    const films = await getFilmsDetailByName(c, name)
    console.log(films)
    return c.json(films)
})



export default filmRoutes
