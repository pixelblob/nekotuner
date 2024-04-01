const {Router} = require("express");
const bodyParser = require('body-parser');
const { playAndParseText, parseMusicResource, addToQueue } = require("../../../utils/queue");
var router = Router({ mergeParams: true });
module.exports = router;

router.post('/', bodyParser.text({type: '*/*'}), async (req, res) => {
    var {channelId} = req.params
    console.log(req.body)
    
    var details = await parseMusicResource(req.body)
    addToQueue("290444481743028224", details)
    res.end()
})