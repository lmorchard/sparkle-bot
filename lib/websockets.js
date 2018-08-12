const uuidV4 = require("uuid/v4");
const path = require("path");
const url = require("url");
const WebSocket = require("ws");

module.exports = context => {
  const {
    BASE_URL,
    INSTANCE_VERSION,
    server
  } = context;
  
  console.log("Setting up websocket listener at /socket");

  const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: ({ origin, req, secure }, cb) => {
      if (origin !== BASE_URL) {
        return cb(false, 403, "Disallowed origin", {});
      }
      // TODO: Auth goes here if needed
      return cb(true);
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
    
    ws.send(
      JSON.stringify({
        event: "serverInstanceVersion",
        serverInstanceVersion: INSTANCE_VERSION
      })
    );
    
    ws.on("message", message => {
      try {
        const data = JSON.parse(message);
        const name = data.event in socketEventHandlers ? data.event : "default";
        socketEventHandlers[name]({ ws, data });
      } catch (err) {
        console.error("socket message error", err);
      }
    });
  });

  setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }
      client.send(
        JSON.stringify({
          event: "systemTime",
          systemTime: Date.now()
        })
      );
    });
  }, 1000);

  const broadcastToWebClients = message => {
    wss.clients.forEach(wsClient => {
      if (wsClient.readyState !== WebSocket.OPEN) return;
      wsClient.send(JSON.stringify(message));
    });
  };

  const socketEventHandlers = {
    default: ({ ws, data }) => {
      console.debug("Unimplemented message", data, ws.id);
    }
  };
  
  return { ...context, wss, broadcastToWebClients };
};