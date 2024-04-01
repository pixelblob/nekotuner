async playYoutubeId(channelId, youtubeId) {
    //return console.log("BLOCKED:", "channelId:", channelId, "YoutubeId:", youtubeId)
    var channel = await client.channels.fetch(channelId)
    var guild = channel.guild

    /* var connection = getVoiceConnection({
        guildId: guild.id,
    }) */
    var connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    })
    var player = connection.state.subscription?.player || createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play }
    })
    player.removeAllListeners("stateChange")
    player.removeAllListeners("error")
    player.removeAllListeners("debug")
    connection.removeAllListeners("debug")
    connection.removeAllListeners("stateChange")

    connection.on('stateChange', (oldState, newState) => {
        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });

    connection.on("debug", debug=>{
        console.log(debug)
    })
    
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
            client.user.setActivity({
                name: `Nothing!`,
                type: ActivityType.Listening
              });
        }
    })

    //console.log(player)

    connection.subscribe(player)

    var resource

    try {
        resource = createAudioResource(await getVideoUrl(youtubeId), { metadata: { url: await getVideoUrl(youtubeId) }, inputType: StreamType.OggOpus });
    } catch (error) {
        console.log(error)
        //return await spotifyClient.skip()
    }

    var newResource = seekResource(resource, 0)

    player.play(newResource)
}