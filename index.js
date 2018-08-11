const path = require("path");
const url = require("url");
const http = require("http");
const uuidV4 = require("uuid/v4");
const TwitchJS = require("twitch-js");
const Koa = require("koa");
const KoaStatic = require("koa-static");
const WebSocket = require("ws");

// TODO: Grab these constants from a config file
const host = "localhost";
const port = 3000;
const baseUrl = `http://${host}:${port}/`;
const webPath = path.join(__dirname, "web");

function init () {
  const server = setupWebServer();
  setupWebSockets(server);
  setupChatBot();
}

function setupWebServer () {
  const app = new Koa();
  app.use(KoaStatic(webPath));

  const server = http.createServer(app.callback());
  server.listen(port, host);

  console.log(`Web server listening on ${baseUrl}`);
  return server;
}

function setupWebSockets (server) {
  const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: ({ origin, req, secure }, cb) => {
      if (origin !== baseUrl) {
        return cb(false, 403, "Disallowed origin", {});
      }
      // TODO: Auth goes here if needed
    }
  });

  server.on("upgrade", (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === "/socket") {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", (ws, req) => {
    ws.id = uuidV4();
    console.log(`WebSocket connection ${ws.id}`);
    ws.on("message", message => {
      try {
        const data = JSON.parse(message);
        const name = data.event in socketEventHandlers ? data.event : "default";
        socketEventHandlers[name]({ ws, data });
      } catch (err) {
        log.error("socket message error", err, data);
      }
    });
  });

  const socketEventHandlers = {
    default: ({ ws, data }) => {
      log.debug("Unimplemented message", data, ws.id, (ws.user || {}).name);
    }
  };
}

function setupChatBot () {
  console.log("Starting chat bot");

  const client = TwitchJS.client({
    channels: ["#lmorchard"],
    identity: require("./config/chat-identity.json")
  });

  // Add chat event listener that will respond to "!command" messages with:
  // "Hello world!".
  client.on("chat", (channel, userstate, message, self) => {
    console
      .log(`Message "${message}" received from ${userstate["display-name"]}`);

    // Do not repond if the message is from the connected identity.
    if (self) return;

    if (message in chatCommands) {
      chatCommands[message]({ client, channel });
    }
  });

  // Finally, connect to the channel
  client.connect();

  const chatCommands = {
    hello: ({ client, channel }) => {
      client.say(channel, "Hello, you.");
    }
  };
}

init();
