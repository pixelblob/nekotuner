const {Router} = require("express");
var router = Router({ mergeParams: true });
module.exports = router;

router.get('/', async (req, res) => {
    res.end("hello world")
})