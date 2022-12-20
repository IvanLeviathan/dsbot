import { isServerBlackListed, isUserBlackListed } from './blacklist.js'
import { legionsSettingsFromDb } from './data.js'
import { getGifFromTenor, isImage, isVideo, makeEmbed, sendMessageToChannel } from './helpers.js'
import { isUserMuted } from './mute.js'

export default async function crosserverChat(client, Discord) {
  client.on('message', async function (message) {
    if (message.channel.type === 'DM') return
    if (message.author.bot) return
    const { guild, channel, author, member } = message
    const curServerSettings = legionsSettingsFromDb[guild.id]

    if (!curServerSettings) return

    if (channel.id !== curServerSettings.botLegionsChannelId) return

    //check for blacklist
    const userBlackListed = await isUserBlackListed(message.member.id)
    const serverBlackListed = await isServerBlackListed(message.guild.id)
    if (userBlackListed || serverBlackListed) {
      const content = serverBlackListed
        ? `Сервер **${message.guild.name}** находится в блок-листе`
        : `Пользователь **${message.member.user.username}** находится в блок-листе`
      message.reply({
        content: content,
      })
      return
    }

    //check for mute
    const isMuted = await isUserMuted(message.guild.id, message.member.id)
    if (isMuted) return

    const { botLegionServerIP, botLegionServerPort } = curServerSettings

    const neededServers = []

    for (let serverId in legionsSettingsFromDb) {
      const curServerInLoop = legionsSettingsFromDb[serverId]
      if (
        botLegionServerIP === curServerInLoop.botLegionServerIP &&
        botLegionServerPort === curServerInLoop.botLegionServerPort &&
        serverId !== guild.id
      )
        neededServers.push(curServerInLoop)
    }

    const embed = makeEmbed(message.content, false, curServerSettings, false)
    embed.setAuthor({
      name: `${member.nickname ? member.nickname : member.user.username} [${
        member.id
      }]`,
      iconURL: author.avatarURL(),
    })

    embed.setFooter(`${curServerSettings.botFooter} [${guild.id}]`)

    //need to check if it is an image url
    if (message.content.startsWith('http')) {
      const image = isImage(message.content)
      if (image) {
        embed.setDescription('')
        embed.setImage(message.content)
      }
    }

    //need to check if its tenor gif
    if (message.content.startsWith('https://tenor.com/view/')) {
      const gif = await getGifFromTenor(message.content)
      if (gif) {
        embed.setDescription('')
        embed.setImage(gif)
      }
    }

    let messageContent = {
      embeds: [embed],
    }

    //need to check if video
    let messageFiles = []
    if (message.attachments) {
      message.attachments.forEach((file) => {
        const video = isVideo(file.url)
        const image = isImage(file.url)
        if (video) messageFiles.push(file.url)
        if (image) embed.setImage(file.url)
      })
    }

    if (messageFiles.length) messageContent.files = messageFiles

    Promise.all(
      neededServers.map(async (server) => {
        const channelForChat = await client.channels.fetch(
          server.botLegionsChannelId,
        ).catch((e) => console.log(e))
        if (!!channelForChat) {
          await sendMessageToChannel(channelForChat, messageContent)
        }
      }),
    )
  })
}
