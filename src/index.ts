import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json'
import { cors } from 'hono/cors';
import { Env } from 'hono';
import  mids  from './mids';

const app = new Hono<{ Bindings: Env }>()
app.use("*",cors())
app.use(prettyJSON()) 
app.use(logger());
// 注册全局路由
app.route('/', mids);

export default app