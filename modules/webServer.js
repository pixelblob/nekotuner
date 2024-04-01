const express = require('express')
const {registerWatchRoutes} = require("pixelroutemagic")
const app = express()
const port = 3000

const bodyParser = require('body-parser')

registerWatchRoutes("./routes", app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})