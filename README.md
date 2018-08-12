sparkle-bot
-----------

A Twitch chat bot teamed up with a web page to make for a festive stream
overlay.

## Hacking

1. Come up with some chat credentials for Twitch - including your Twitch
   username, your bot's username, and [an OAuth token password](http://twitchapps.com/tmi/)

1. Put that information in `config/chat-identity.json`

1. `npm install`

1. `npm start`

1. Add this URL as a browser source overlay in your streaming software at 1920x1080: http://localhost:3000/

1. Type `!boom 100 100` in your chat!

## TODO

- [ ] Add sound to the fireworks

- [ ] Rate limit per user - only one boom per minute?

- [ ] Make the fireworks more dramatic

- [ ] Share this as a project on Glitch?

- [ ] Add eslint checking
