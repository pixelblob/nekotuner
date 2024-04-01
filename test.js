const axios = require("axios")
const { token } = require("./config.json")

setChannelStatus("1184654010700021771", "")
async function setChannelStatus(channelId, status) {
    let data = (await axios.put(
        'https://discord.com/api/v9/channels/'+channelId+'/voice-status',
        {
            'status': status
        },
        {
            headers: {
                'authorization': 'Bot ' + token
            }
        }
    )).data;
    console.log(data)
}
