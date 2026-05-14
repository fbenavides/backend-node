import Router from '@koa/router';

export function createHealthRouter() {
  const router = new Router();

  router.get('/health', (ctx) => {
    ctx.body = {
      status: 'OK',
      service: 'koa-socket-michi',
    };
  });

  return router;
}