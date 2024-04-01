const {Router} = require("express");
const { getCurrentSong, getGuildQueue, findUserVoiceChannel } = require("../../utils/queue");
const { playYoutubeId } = require("../../utils/youtube");
var router = Router({ mergeParams: true });
module.exports = router;

router.post('/', async (req, res) => {
    var channel = findUserVoiceChannel("290444481743028224")
    let guildQueue = getGuildQueue(channel.guildId)
    if (guildQueue.currentIndex > 0) {
        guildQueue.currentIndex--
        playYoutubeId(channel.id, guildQueue.queue[guildQueue.currentIndex].youtubeId)
        return res.json({
            result: guildQueue.queue[guildQueue.currentIndex]
        })
    }
    res.status(400).json({
        error: "Beginning Of Queue Reached"
    })
})