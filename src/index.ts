import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors';
import { loggerMiddleware } from './middlewares/logger';
import userRoutes from './routes/userRoutes';
import filmRoutes from './routes/filmsRoutes';
import commentRoutes from './routes/commentRoutes';
import cmsRoutes from './routes/cmsRoutes';
import tokenRoutes from './routes/tokenRoutes';
import parsersRoutes from './routes/parsersRoutes';



const app = new Hono()
app.use("*",cors())
app.use('*', loggerMiddleware)

app.use(prettyJSON()) 
app.use(logger());


app.route('/users', userRoutes)
app.route('/auth', tokenRoutes)
app.route('/films', filmRoutes)  // 相当于 跳转到详情页面

app.route('/parsers', parsersRoutes) //解析
app.route('/comments', commentRoutes) //评论
app.route('/cms', cmsRoutes) //cms 管理 操作



export default app


