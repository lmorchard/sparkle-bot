sparkle-bot
-----------

A Twitch chat bot teamed up with a web page to make for a festive stream
overlay.

[![Let there be fireworks](https://img.youtube.com/vi/SNBcUJ87j7Q/0.jpg)](https://www.youtube.com/watch?v=SNBcUJ87j7Q)

## Hacking on Glitch

1. Remix my project - <https://glitch.com/edit/#!/lmorchard-sparkle-bot>

1. Get chat credentials for Twitch - including your Twitch username, your bot's username, and [an OAuth token password](http://twitchapps.com/tmi/) for your bot.

1. Copy `.env.sample` to `.env` and fill out the variables with your chat credentials.

1. Use your project URL as a browser source overlay in your streaming software at 1920x1080.

1. Type `!boom 100 100` in your chat - if your bot is there, it should answer and you should see fireworks!

## TODO

- [ ] Add sound to the fireworks

- [ ] Rate limit per user - only one boom per minute?

- [ ] Make the fireworks more dramatic

- [ ] Add eslint checking
