const path = require("path");
const http = require("http");
const Koa = require("koa");
const KoaStatic = require("koa-static");

module.exports = context => {
  const {
    HOST,
    PORT,
    BASE_URL
  } = context;
  
  const app = new Koa();
  app.use(KoaStatic(path.join(__dirname, "../web")));

  const server = http.createServer(app.callback());
  server.listen(PORT, HOST);

  console.log(`Web server listening on ${BASE_URL}`);
  
  return { ...context, app, server };
};