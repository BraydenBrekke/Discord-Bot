# discordbot
My Discord Bot written in discord.js

------------

### **Commands**
Prefixed by !
- summon = Summons the bot to a voice channel
- play + URL or yt + URL = joins voice channel and either adds song to queue or starts queue
- pause = Pauses current song
- Skip = Skips to next song in queue
- resume = Resumes current song in queue
- queue = Puts the songs that are currently in queue into the chat
- clear = Deletes every song from queue
- clean + Number = deletes however many messages
- leave = Bot leaves voice chat
- ping = pong
- ip = direct messages the ip in the form of a dns or url


### Features
Youtube search along with top three song decision

Song title is displayed in the bot's status

DockerFile to start the bot inside a container. Use docker-compose up with arguemtns for discord_token and youtube_token