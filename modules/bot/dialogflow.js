import * as uuid from 'uuid'
import axios from 'axios'
import { isUserMuted } from './mute.js'
import { getRandomGifFromTenor, sendMessageToChannel } from './helpers.js'
import { legionsSettingsFromDb } from './data.js'
import { isServerBlackListed, isUserBlackListed } from './blacklist.js'

const dfUrlStart =
  'https://console.dialogflow.com/v1/integrations/messenger/webhook/'
const sessionId = uuid.v4()

const catgirlTenorUrl = 'https://tenor.com/search/catgirl-gifs'
const catgirlIntent = 'smalltalk.user.want_a_catgirl'

async function runSample(text) {
  // A unique identifier for the given session
  const json = {
    queryInput: {
      text: {
        text: text,
        languageCode: 'ru',
      },
    },
  }

  const urlArr = [
    dfUrlStart,
    process.env.DIALOGFLOW_WEB_ID,
    '/sessions/',
    'webdemo-',
    sessionId,
    '?platform=webdemo',
  ]
  const response = await axios.post(urlArr.join(''), json)
  const responseJson = JSON.parse(response.data.substring(4))
  return responseJson
}

export const messageAddiction = async (msgContent, sample) => {
  if (sample.queryResult?.intent?.displayName === catgirlIntent) {
    const gifImage = await getRandomGifFromTenor(catgirlTenorUrl)
    if (!!gifImage) msgContent.files = [gifImage]
  }
  return msgContent
}

export default async function dialogflowConst(client) {
  client.on('message', async (message) => {
    if (message.author.bot) return
    if (message.channel.type !== 'DM') return

    const userBlackListed = await isUserBlackListed(message.author.id)
    if (userBlackListed) {
      const content = `Пользователь **${message.author.username}** находится в блок-листе`
      return message
        .reply({
          content: content,
        })
        .catch((e) => console.log(e))
    }
    if (!message.content) return
    let messageWithNoMentions = message.content.replace(/<@.+>/i, '').trim()
        messageWithNoMentions = messageWithNoMentions.replace(/<:.+>/i, '').trim()
        messageWithNoMentions = messageWithNoMentions.replace(/<a:.+>/i, '').trim()
    if (!messageWithNoMentions) return
    message.channel.sendTyping()
    const sample = await runSample(messageWithNoMentions)

    let msgContent = {
      content: sample.queryResult?.fulfillmentText || 'Перефразируй',
    }

    msgContent = await messageAddiction(msgContent, sample)

    await sendMessageToChannel(message.channel, msgContent)
  })
  client.on('message', async (message) => {
    if (message.author.bot) return

    if (message.channel.type === 'DM') return

    const { guild, channel, author, member } = message
    const curServerSettings = legionsSettingsFromDb[guild.id]

    if (!!curServerSettings)
      if (channel.id === curServerSettings.botLegionsChannelId) return

    const userBlackListed = await isUserBlackListed(message.member.id)
    const serverBlackListed = await isServerBlackListed(message.guild.id)

    //check for mute
    const isMuted = await isUserMuted(message.guild.id, message.member.id)
    if (isMuted) return
    if (!!message.content) {
      if (!message.mentions.users.has(client.user.id)) return

      if (userBlackListed || serverBlackListed) {
        const content = serverBlackListed
          ? `Сервер **${message.guild.name}** находится в блок-листе`
          : `Пользователь **${message.member.user.username}** находится в блок-листе`
        message.reply({
          content: content,
        })
        return
      }

      let messageWithNoMentions = message.content.replace(/<@.+>/i, '').trim()
          messageWithNoMentions = messageWithNoMentions.replace(/<:.+>/i, '').trim()
          messageWithNoMentions = messageWithNoMentions.replace(/<a:.+>/i, '').trim()
      if (!!messageWithNoMentions) {
        message.channel.sendTyping()
        const sample = await runSample(messageWithNoMentions)
        // console.log(sample)

        let msgContent = {
          content: sample.queryResult?.fulfillmentText || 'Перефразируй',
        }

        msgContent = await messageAddiction(msgContent, sample)

        await message.reply(msgContent)
      }
    }
  })
}
