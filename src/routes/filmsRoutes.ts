import { Hono } from 'hono'
import { getFilmsDetailByName } from '../services/films/getFilmsDetailByName'
import { authAccessMiddleware } from '../middlewares/auth'

const filmRoutes = new Hono()

filmRoutes.get('/id/:id', async c => {

})

filmRoutes.get('/name/:name', authAccessMiddleware, async c => {
    const { name } = c.req.param()
    const films = await getFilmsDetailByName(c, name)
    console.log(films)
    return c.json(films)
})



export default filmRoutes
