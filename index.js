require("./modules/load")
var {youtube} = require("./utils/load")

const { generateDependencyReport } = require('@discordjs/voice');

console.log(generateDependencyReport());