import axios from 'axios'
import { updateBotStatus, updateBotNamesOnServers } from './helpers.js'
import { cleanServerSettings } from '../../controllers/settings/index.js'
export default async function intervals(client) {
  client.on('ready', async () => {
    updateBotStatus(client)
    updateBotNamesOnServers(client)
    // cleanServerSettings(client)
    let dt, now, datePlus3
    setInterval(function () {
      now = new Date()
      dt = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
      dt.setUTCHours(dt.getUTCHours() + 3)
      // setted moscow time

      console.log(
        `${client.user.username} is online and running!`,
        dt.toLocaleDateString(),
        dt.toLocaleTimeString(),
      )
    }, 60000)
    // ;(function wake() {
    //   try {
    //     const handler = setInterval(() => {
    //       axios
    //         .get(process.env.BOT_HOSTING_URL)
    //         .then((res) =>
    //           console.log(`response-ok: ${res.ok}, status: ${res.status}`),
    //         )
    //         .catch((err) => console.error(`Error occured: ${err}`))
    //     }, 10 * 60 * 1000)
    //   } catch (err) {
    //     console.error('Error occured: retrying...')
    //     clearInterval(handler)
    //     return setTimeout(() => wake(), 10000)
    //   }
    // })()
  })
}
