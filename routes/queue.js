const {Router} = require("express");
const { getCurrentSong, getGuildQueue, findUserVoiceChannel } = require("../utils/queue");
var router = Router({ mergeParams: true });
module.exports = router;

router.get('/', async (req, res) => {
    let guildQueue = getGuildQueue("716871605749416020")
    res.json(guildQueue)
})