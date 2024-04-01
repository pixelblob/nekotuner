const fs = require("fs")
const Discord = require('discord.js');

const {ChannelType} = require('discord.js');

const { playYoutubeId, getRandomSong } = require("../utils/youtube");

module.exports = {
    name: 'ready',
    once: true,
    /**
* @param {Discord.Client} client
*/
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log(`Found ${client.guilds.cache.size} Servers: [${client.guilds.cache.map(g => g.name).join(", ")}]`)
        var pixelsVoiceChannel = client.channels.cache.find(c=>c.type == ChannelType.GuildVoice && c.members.has("290444481743028224"))
        if (pixelsVoiceChannel) {
            let randomSong = await getRandomSong()
            console.log(randomSong)
            //playYoutubeId(pixelsVoiceChannel.id, "2QdPxdcMhFQ")
        }
        //playYoutubeId()
    },
};
