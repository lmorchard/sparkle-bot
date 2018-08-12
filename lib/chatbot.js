const TwitchJS = require("twitch-js");

module.exports = context => {
  const {
    CHAT_CHANNELS,
    CHAT_USERNAME,
    CHAT_PASSWORD,
    wss,
    broadcastToWebClients
  } = context;

  console.log(`Starting chat bot named ${CHAT_USERNAME}`);

  const client = TwitchJS.client({
    // HACK: Convert "foo,bar,baz" to ["#foo", "#bar", "#baz"]
    channels: CHAT_CHANNELS.split(",").map(c => `#${c}`),
    identity: {
      username: CHAT_USERNAME,
      password: CHAT_PASSWORD
    }
  });

  client.on("chat", (channel, userstate, message, self) => {
    // Do not repond if the message is from the connected identity.
    if (self) return;

    const [command, ...args] = message.split(" ");
    if (command.substr(0, 1) === "!") {
      const commandWord = command.substr(1);
      if (commandWord in chatCommands) {
        chatCommands[commandWord]({
          args,
          client,
          channel,
          userstate,
          commandWord
        });
      }
    }
  });

  // Finally, connect to the channel
  client.connect();

  const chatCommands = {
    boom: ({ args, client, channel, userstate, message }) => {
      const [number = 1, spread = 30] = args;
      client.say(channel, `Okay, you asked for it!`);
      broadcastToWebClients({ event: "boom", number, spread });
    },

    hello: ({ client, channel, userstate, message }) => {
      client.say(channel, `Hello, ${userstate["display-name"]}.`);
      broadcastToWebClients({
        event: "saidHello",
        message,
        userstate
      });
    }
  };
};
