import blacklist from './blacklist.js'
import commands from './commands.js'
import common from './common.js'
import crosserverChat from './crosserverChat.js'
import { getDataFromDb } from './data.js'
import dialogflowConst from './dialogflow.js'
import imports from './import.js'
import intervals from './intervals.js'
import levels from './levels.js'
import mute from './mute.js'
import online from './online.js'

export let client = null
export default async function botStart(botClient, botToken, Discord) {
  client = botClient

  //load data
  await getDataFromDb()

  // blacklist
  await blacklist(client)

  //mute functions and ticks
  await mute(client, Discord)

  //apply commands
  commands(client, Discord)

  //apply intervals
  intervals(client)

  //apply levels functions
  levels(client, Discord)

  //apply crosserver chat functions
  crosserverChat(client, Discord)

  //online functions like send, stat, etc
  online(client, Discord)

  //dialogflow
  dialogflowConst(client)

  //another tricks
  common(client)

  //imports to db
  // imports()

  await client.login(botToken)
}
