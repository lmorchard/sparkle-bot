/* global fireworks */

let socket, serverInstanceVersion;
let reconnectTimer;

function init() {
  window.onload = () => {
    fireworks.loop();
  };
  connectSocket();
}

const socketSend = (event, data = {}) => {
  if (!socket) return;
  socket.send(JSON.stringify({ ...data, event }));
};

function connectSocket() {
  const { protocol, host } = window.location;
  const wsUrl = `${protocol === "https:" ? "wss" : "ws"}://${host}/socket`;
  console.log("wsUrl", protocol, wsUrl);

  console.log(`Connecting websocket to ${wsUrl}`);
  socket = new WebSocket(wsUrl);
  
  socket.addEventListener("open", event => {
    console.log("Websocket connected!");
    if (reconnectTimer) clearInterval(reconnectTimer);
  });

  socket.addEventListener("close", event => {
    console.log("Websocket disconnected!");
    if (reconnectTimer) clearInterval(reconnectTimer);
    reconnectTimer = setInterval(connectSocket, 1000);
  });

  socket.addEventListener("message", event => {
    try {
      const data = JSON.parse(event.data);
      const name = data.event in socketEventHandlers ? data.event : "default";
      socketEventHandlers[name](data, event);
    } catch (err) {
      console.log("socket message error", err, event);
    }
  });
}

const socketEventHandlers = {
  default: (data) => {
    console.log("unexpected socket message", data);
  },

  boom: (data) => {
    const number = Math.max(1, Math.min(100, parseInt(data.number)));
    const spread = Math.max(15, Math.min(360, parseInt(data.spread)));

    console.log("boom", number, spread);
    
    for (let idx = 0; idx < number; idx++) {
      const delay = parseInt(spread * Math.random());
      fireworks.randomLaunch(delay);
    }
  },

  saidHello: ({ message, userstate }) => {
    console.log("saidHello", message, userstate);
    const messageEl = document.querySelector("#message");
    messageEl.innerText = `Last Hello: ${
      userstate["display-name"]
    } at ${new Date().toISOString()}`;
  },

  systemTime: ({ systemTime }) => {
    const messageEl = document.querySelector("#systemTime");
    messageEl.innerText = `System Time: ${new Date(systemTime).toISOString()}`;
  },

  serverInstanceVersion: (data) => {
    if (!serverInstanceVersion) {
      serverInstanceVersion = data.serverInstanceVersion;
      console.log("serverInstanceVersion", serverInstanceVersion);
    } else if (serverInstanceVersion !== data.serverInstanceVersion) {
      console.log("serverInstanceVersion changed, reloading");
      window.location.reload();
    }
  }
};

init();