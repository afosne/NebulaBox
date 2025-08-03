import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui'
import { swaggerConfig } from './config/swaggerConfig';
import { timing } from 'hono/timing'
import { routers } from './routers';

const app = new Hono();
// 全局中间件

//首页介绍文档
app.get('/', (c) => c.text('traveler api'));
//创建api文档
app.get('/ui', swaggerUI({ url: '/docs' }))
app.get('/docs', (c) => c.json(swaggerConfig));

//检测接口效率
app.use(timing())
//注册子节点路由
routers.forEach(({ path, router }) => {app.route(path, router);})

export default app;