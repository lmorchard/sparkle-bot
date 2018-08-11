console.log("HELLO!");

let socket, serverInstanceVersion;
let reconnectTimer;

function init () {
  window.onload = () => {
    fireworksLoop();
  }
  connectSocket();
}

const socketSend = (event, data = {}) => {
  if (!socket) return;
  socket.send(JSON.stringify({ ...data, event }));
};

function connectSocket() {
  const { protocol, host } = window.location;
  const wsUrl = `${protocol === "https" ? "wss" : "ws"}://${host}/socket`;

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
      socketEventHandlers[name]({ event, data });
    } catch (err) {
      console.log("socket message error", err, event);
    }
  });
}

const socketEventHandlers = {
  default: ({ data }) => {
    console.log("unexpected socket message", data);
  },

  boom: () => {
    const numLaunch = parseInt(Math.random() * 10);
    for (let idx = 0; idx < numLaunch; idx++) {
      fireworksLaunch();
    }
  },

  saidHello: ({ data: { message, userstate } }) => {
    console.log("saidHello", message, userstate);
    const messageEl = document.querySelector("#message");
    messageEl.innerText = `Last Hello: ${userstate["display-name"]} at ${(new Date()).toISOString()}`;
  },

  systemTime: ({ data: { systemTime } }) => {
    const messageEl = document.querySelector("#systemTime");
    messageEl.innerText = `System Time: ${(new Date(systemTime)).toISOString()}`;
  },

  serverInstanceVersion: ({ data }) => {
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
