const fs = require("fs")

var modules = fs.readdirSync("./modules").filter(f=>f.endsWith(".js"))
for (const moduleFile of modules) {
    require("./"+moduleFile)
}
