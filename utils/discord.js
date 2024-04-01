const { default: axios } = require("axios");
const {token} = require("../config.json")

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
module.exports = {
    setChannelStatus
}