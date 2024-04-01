const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType } = require("@discordjs/voice")
var {client} = require("../modules/discordClient")
const axios = require("axios")
var {} = require("discord.js")
const fluentFfmpeg = require('fluent-ffmpeg');
const STREAM = require('node:stream');
const NodeCache = require("node-cache");
const ytdl = require('ytdl-core');
const { setChannelStatus } = require("./discord");

const youtubeUrlCache = new NodeCache({ stdTTL: 300 });


async function playYoutubeId(voiceChannelId, youtubeId) {
    var voiceChannel = await client.channels.fetch(voiceChannelId)
    var guild = voiceChannel.guild

    const { getGuildQueue } = require("./queue");

    var connection = getVoiceConnection(guild.id) || joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    })

    connection.removeAllListeners("debug")
    connection.removeAllListeners("stateChange")

    connection.on("debug", debug=>{
        console.log(debug)
    })

    connection.on('stateChange', (oldState, newState) => {
        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });

    var player = connection.state.subscription?.player || createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play }
    })

    player.removeAllListeners("stateChange")
    player.removeAllListeners("error")
    player.removeAllListeners("debug")

    player.on("debug", debug=>{
        console.log(debug)
    })

    player.on("error", async err => {
        console.log(err)
    })

    player.on("stateChange", async (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        if (newState.status == "idle") {
            console.log("Song Finished!")
            var queueStore = getGuildQueue(guild.id)
            if (queueStore.currentIndex < queueStore.queue.length-1) {
                queueStore.currentIndex++
                playYoutubeId(voiceChannelId, queueStore.queue[queueStore.currentIndex].youtubeId)
            } else {
                console.log("REACHED END OF QUEUE!")
            }
        }
    })

    connection.subscribe(player)
    

    var resource = createAudioResource(await getVideoUrl(youtubeId), { metadata: { url: await getVideoUrl(youtubeId) }, inputType: StreamType.OggOpus });

    var newResource = seekResource(resource, 0)

    player.play(newResource)

}

async function getVideoUrl(youtubeId) {
    if (youtubeUrlCache.has(youtubeId)) return youtubeUrlCache.get(youtubeId)
    let info = await ytdl.getInfo(youtubeId);
    let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    youtubeUrlCache.set(youtubeId, format.url)
    return format.url
}

function seekResource(resource, ms) {
    let bufferStream = new STREAM.PassThrough();
    let bufferStreampass = new STREAM.PassThrough();
    var stream = fluentFfmpeg({ source: resource.metadata.url }).outputFormat('ogg').audioCodec("libopus").setStartTime(Math.ceil(ms / 1000) || 0).addOptions("-hide_banner").addOutputOptions("-filter:a loudnorm").addInputOptions("-rtbufsize", "1G", "-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "5", "-reconnect_on_network_error", "1")
        .on('error', function (err, stdout, stderr) {
            console.log('Cannot process video: ' + err?.message);
            console.log(stdout)
            console.log(stderr)
        })
        .on('stderr', function (stderrLine) {
            //console.log('Stderr output: ' + stderrLine);
        })
    stream.pipe(bufferStream)
    const buffers = [];
    bufferStream.on('data', function (buf) {
        buffers.push(buf);
        bufferStreampass.write(buf)
    });
    //const newstream = Readable.from(buffers);
    bufferStream.on('end', function () {
        //const outputBuffer = Buffer.concat(buffers);
        // use outputBuffer
        bufferStreampass.end()
        console.log("Finished Downloading Song!")
    });
    var newResource = createAudioResource(bufferStreampass, { metadata: resource.metadata, inputType: StreamType.OggOpus });
    newResource.playbackDuration = resource.playbackDuration
    return newResource
}

async function getRandomSong() {
    let data = (await axios.get("http://192.168.0.190:4500/random")).data
    return data.result
}

module.exports = {
    playYoutubeId,
    getRandomSong
}