const {Router} = require("express");
const { getCurrentSong } = require("../utils/queue");
var router = Router({ mergeParams: true });
module.exports = router;

router.get('/', async (req, res) => {
    res.json(getCurrentSong("716871605749416020"))
})