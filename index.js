// Get our basic config out of the environment, with defaults
const {
  HOST = "localhost",
  PORT = 3000,
  NODE_ENV = "development",
  PROJECT_DOMAIN,
  CHAT_CHANNELS,
  CHAT_USERNAME,
  CHAT_PASSWORD
} = process.env;

// Each submodule of the app is a reducer that takes in the
// app context and returns it with things added or changed
[
  require("./lib/webserver"),
  require("./lib/websockets"),
  require("./lib/chatbot")
].reduce((context, fn) => fn(context), {
  HOST,
  PORT,
  NODE_ENV,
  PROJECT_DOMAIN,
  CHAT_CHANNELS,
  CHAT_USERNAME,
  CHAT_PASSWORD,
  INSTANCE_VERSION: `${Date.now()}-${Math.random()}`,
  IS_GLITCH: PROJECT_DOMAIN !== null,
  BASE_URL: PROJECT_DOMAIN
    ? `https://${PROJECT_DOMAIN}.glitch.me`
    : `http://${HOST}:${PORT}`
});