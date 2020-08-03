const token = process.env.discord_token
const youtube_api = process.env.youtube_token
const Discord = require("discord.js");
const bot = new Discord.Client();
const yt = require('ytdl-core-discord');
const axios = require("axios")
var prefix = '!';
var dispatcher;
var queue = [];
var next;
var title = "";
var member;
var voiceChannel;
var audio;

bot.on("message", async msg => {
    if (!msg.content.startsWith(prefix)) return;
    if (msg.member.voice.channel != undefined) voiceChannel = msg.member.voice.channel;
    if (msg.content.startsWith(prefix + "summon")) {
        if (!voiceChannel) return msg.channel.send("Connect to a channel first");
        msg.member.voice.channel.join();
    }
    if (msg.content.startsWith(prefix + "play") || msg.content.startsWith(prefix + "yt")) {
        if (!voiceChannel) return msg.channel.send("Connect to a channel first");
        var input = msg.content.split(" ");
        input.splice(0, 1);
        input = input.join(" ");
        msg.channel.lastMessage.delete();
        axios.get('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=' + input + '&type=video&key=' + youtube_api).then((response) => {
            results= response.data
            msg.channel.send("0:   " +results.items[0].snippet.title + '\n' + "1:   " +results.items[1].snippet.title + '\n' + "2:   " +results.items[2].snippet.title);
            msg.member.voice.channel.join().then(connection => {
                const filter = m => m.content.includes('0') || m.content.includes('1') || m.content.includes('2') || m.content.startsWith(prefix);
                const collector = msg.channel.createMessageCollector(filter, {
                    time: 15000
                });
                collector.on('collect', m => {
                    if (m.content == 0) {
                        collector.stop();
                        title =results.items[0].snippet.title;
                        add(results.items[0]);
                    }
                    if (m.content == 1) {
                        collector.stop();
                        title =results.items[1].snippet.title;
                        add(results.items[1]);
                    }
                    if (m.content == 2) {
                        collector.stop();
                        title =results.items[2].snippet.title;
                        add(results.items[2]);
                    }
                    if (m.content.startsWith(prefix)) {
                        collector.stop();
                    }
                });

                collector.on('end', collected => {
                    msg.channel.bulkDelete(2);
                });

                function add(song) {
                    console.log(msg.author.username.toUpperCase() + " Requested " + title);
                    queue.push("https://www.youtube.com/watch?v=" + song.id.videoId);
                    if (dispatcher === undefined) {
                        play(queue[0]);
                    }
                }
                async function play(url) {
                    bot.user.setActivity(title);
                    dispatcher = connection.play(await yt(url), {
                        type: 'opus'
                    });
                    let collector = msg.channel.createMessageCollector(n => n);
                    collector.on('collect', n => {
                        if (n.content.startsWith(prefix + "pause")) {
                            if (dispatcher === undefined) {
                                return msg.channel.send("nothing to pause");
                            } else {
                                msg.channel.send("paused!");
                                dispatcher.pause();
                            }
                        }
                        if (n.content.startsWith(prefix + "skip")) {
                            if (dispatcher !== undefined) {
                                dispatcher.end();
                            } else return msg.channel.send("nothing to skip");
                        }
                        if (n.content.startsWith(prefix + "resume")) {
                            if (dispatcher !== undefined) {
                                dispatcher.resume();
                                msg.channel.send("resumed!");
                            } else return msg.channel.send("nothing to resume");
                        }
                    });
                    dispatcher.on('finish', () => {
                        setTimeout(function() {
                            collector.stop();
                            if (queue.length > 1) {
                                queue.shift();
                                bot.user.setActivity(title);
                                play(queue[0])
                            } else {
                                dispatcher = undefined;
                                connection.disconnect();
                                queue = [];
                                bot.user.setActivity("Type !help for commands");
                            }
                        }, 300);
                    });
                }
            });
        })
        .catch(function (error) {
            console.log(error);
        })
    }
    if (msg.content.startsWith(prefix + "help")) {
        msg.channel.send(
            "commands: " + '\n' +
            "" + '\n' +
            "summon = Summons the bot to a voice channel" + '\n' +
            "play + URL or yt + URL = joins voice channel and either adds song to queue or starts queue" + '\n' +
            "pause = Pauses current song" + '\n' +
            "Skip = Skips to next song in queue" + '\n' +
            "resume = Resumes current song in queue" + '\n' +
            "queue = Puts the songs that are currently in queue into the chat" + '\n' +
            "clear = Deletes every song from queue" + '\n' +
            "clean + Number = deletes however many messages (specified by number -2 because of bug)" + '\n' +
            "leave = Bot leaves voice chat" + '\n' +
            "ping = pong" + '\n' +
            "ip = direct messages the ip in the form of a dns or url"
        );
    }
    if (msg.content.startsWith(prefix + "clean")) {
        var rest = msg.content.split(" ");
        rest.splice(0, 1);
        rest = rest.join(" ");
        if (isNaN(rest) === false && rest <= 99) {
            msg.channel.bulkDelete(++rest);
        } else {
            msg.channel.send("Bot can only clean a value of 0 - 100 messages");
        }
        console.log("deleted " + --rest + " messages");
    }
    if (msg.content.startsWith(prefix + "leave")) {
        if (!voiceChannel) return msg.channel.send("Connect to a channel first");
        msg.guild.me.voice.channel.leave();
    }
    if (msg.content.startsWith(prefix + "ping")) {
        msg.channel.send("pong!");
    }
    if (msg.content.startsWith(prefix + "queue")) {
        if (queue[0] !== undefined) {
            msg.channel.send(queue);
        } else return msg.channel.send("Nothing in queue");
    }
    if (msg.content.startsWith(prefix + "clear")) {
        if (queue !== undefined && queue.length > 0) {
            queue = [];
            msg.channel.send("Queue has been cleared");
        } else return msg.channel.send("The queue is already empty");
    }
});
bot.on('ready', () => {
    console.log('Bot is online!');
    bot.user.setActivity("Type !help for commands");
});
bot.on('error', function() {
    return 'error'
});
bot.login(token);
