const NodeCache = require("node-cache");
const { playYoutubeId } = require("./youtube");
const { default: axios } = require("axios");
const { client } = require("../modules/discordClient");
const { setChannelStatus } = require("./discord");
const { ChannelType } = require("discord.js");
const path = require('path');

var guildQueueStore = {}

const youtubeEquivelentCache = new NodeCache();

function createGuildQueue(guildId, reset) {
    if (guildQueueStore[guildId] && !reset) return
    console.log("Creating Queue for:", guildId)
    guildQueueStore[guildId] = {
        currentIndex: 0,
        queue: []
    }
}

function getCurrentSong(guildId) {
    var queueStore = guildQueueStore[guildId]
    if (!queueStore) return null
    return queueStore.queue[queueStore.currentIndex] || null
}

function getGuildQueue(guildId) {
    if (!guildQueueStore[guildId]) createGuildQueue(guildId)
    return guildQueueStore[guildId]
}

function addToQueue(requesterId, details = {}) {
    var { youtubeId } = details
    console.log(details)
    if (!youtubeId) return console.log("Invalid Song Added To Queue!")
    var channel = findUserVoiceChannel(requesterId)
    var queueStore = getGuildQueue(channel.guildId)
    var firstSong = queueStore.queue.length == 0
    queueStore.queue.push({
        ...details
    })
    if (firstSong) {
        console.log("FIRST SONG IN QUEUE!")
        playYoutubeId(channel.id, youtubeId)
    }
}

function findUserVoiceChannel(userId) {
    for (const channel of Array.from(client.channels.cache.values())) {
        if (channel.type != ChannelType.GuildVoice) continue;
        if (channel.members.has(userId)) return channel
    }
}

async function getYoutubeEquivalent(spotifyId) {
    var start = new Date().getTime()
    console.log("Started Get Youtube Equ")
    if (!youtubeEquivelentCache.has(spotifyId)) {
        console.log("Youtube Equ Not In Cache")
        var data
        try {
            data = (await axios.get("http://127.0.0.1:4500/idAlternative/" + spotifyId)).data
        } catch (error) {
            console.log(error)
            console.log("Youtube Equ Failed")
            return null
        }
        youtubeEquivelentCache.set(spotifyId, data)
        console.log("getYoutubeEquivalent: " + (new Date().getTime() - start) + "ms")
        return data.result
    } else return youtubeEquivelentCache.get(spotifyId).result
}

async function parseMusicResource(text) {

    const spRegex = /^(https:\/\/open.spotify.com\/track\/|spotify:user:spotify:playlist:)([a-zA-Z0-9]+)(.*)$/i
    var spMatch = text.match(spRegex)
    if (spMatch) {
        var spotifyId = spMatch[2]
        console.log(spotifyId)
        var data = await getYoutubeEquivalent(spotifyId)
        if (!data) throw new Error("No Youtube Equivalent!")
        var { youtubeId, name, artists, album } = data

        return { youtubeId, name, artists, album }
    }



    const ytRegex = /(?:http?s?:\/\/)?(?:www.)?(?:m.)?(?:music.)?youtu(?:\.?be)(?:\.com)?(?:(?:\w*.?:\/\/)?\w*.?\w*-?.?\w*\/(?:embed|e|v|watch|.*\/)?\??(?:feature=\w*\.?\w*)?&?(?:v=)?\/?)([\w\d_-]{11})(?:\S+)?/i
    var ytMatch = text.match(ytRegex)
    if (ytMatch) {
        var youtubeId = ytMatch[1]

        return { youtubeId }
    }

}

function parseAudioFile(file) {
    var audioExtensions = ["mp3"]
    var url = new URL(file)
    var filename = path.basename(url.pathname)
    var extension = filename.split('.').pop()
    console.log(extension)
    if (audioExtensions.includes(audioExtensions)) throw Error("Not An Audio File!")
}

async function playAndParseText(text, channelId) {
    var voiceChannel = await client.channels.fetch(channelId)
    var guild = voiceChannel.guild

    var details = {}

    const spRegex = /^(https:\/\/open.spotify.com\/track\/|spotify:user:spotify:playlist:)([a-zA-Z0-9]+)(.*)$/i
    var spMatch = text.match(spRegex)
    if (spMatch) {
        var spotifyId = spMatch[2]
        console.log(spotifyId)
        var data = await getYoutubeEquivalent(spotifyId)
        if (!data) throw new Error("No Youtube Equivalent!")
        var { youtubeId, name, artists } = data

        details = { youtubeId, name, artists }

        await playYoutubeId(channelId, youtubeId)
        return
    }



    const ytRegex = /(?:http?s?:\/\/)?(?:www.)?(?:m.)?(?:music.)?youtu(?:\.?be)(?:\.com)?(?:(?:\w*.?:\/\/)?\w*.?\w*-?.?\w*\/(?:embed|e|v|watch|.*\/)?\??(?:feature=\w*\.?\w*)?&?(?:v=)?\/?)([\w\d_-]{11})(?:\S+)?/i
    var ytMatch = text.match(ytRegex)
    if (ytMatch) {
        var youtubeId = ytMatch[1]
        console.log(youtubeId)

        await playYoutubeId(msg.member.voice.channel.id, youtubeId)
        return
    }

    var { youtubeId, name, artists } = details

    setChannelStatus(channelId, `${name} - ${artists[0].name}`)

    addToQueue(guild.id, details)

}

module.exports = {
    createGuildQueue,
    getGuildQueue,
    addToQueue,
    playAndParseText,
    parseMusicResource,
    getCurrentSong,
    findUserVoiceChannel,
    guildQueueStore
}