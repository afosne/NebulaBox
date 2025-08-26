import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors';
import { loggerMiddleware } from './middlewares/logger';
import userRoutes from './routes/userRoutes';
import filmRoutes from './routes/filmRoutes';
import commentRoutes from './routes/commentRoutes';
import cmsRoutes from './routes/cmsRoutes';
import { authMiddleware } from './middlewares/auth';

const app = new Hono()
app.use("*",cors())
app.use(prettyJSON()) 
app.use(logger());
app.use('*', loggerMiddleware)

app.route('/users', userRoutes)
app.route('/films', filmRoutes)
app.route('/comments', commentRoutes)
app.route('/cms', cmsRoutes)


export default app


