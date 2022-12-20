import { MessageActionRow, MessageButton } from 'discord.js'
import {
  getGuildMessages,
  getUserMessagesCount,
} from '../../../controllers/levels/index.js'
import { makeEmbed } from '../helpers.js'
import { calcUserLevel } from '../levels.js'

const generateList = async (embed, list, index, onPage) => {
  const listLength = list.length
  const lastNum = index + onPage
  list = list.slice(index, index + onPage)
  
  embed.setDescription(`Список уровней на сервере\n**${index + 1}** - **${lastNum > listLength ? listLength : lastNum}** / **${listLength}**`)
  await Promise.all(
    list.map((item, userIndex) => {
      embed.addField(
        `#${index + userIndex + 1}`,
        `<@${item.userId}> - ${calcUserLevel(item.messagesCount)} уровень`,
      )
    }),
  )
}

const func = async (interaction, options) => {
  const guildMessages = await getGuildMessages(interaction.guild.id)

  const backId = 'back'
  const forwardId = 'forward'
  let currentIndex = 0
  const onPage = 10

  const backComponent = new MessageButton({
    style: 'SECONDARY',
    emoji: '⬅️',
    customId: backId,
  })

  const forwardComponent = new MessageButton({
    style: 'SECONDARY',
    emoji: '➡️',
    customId: forwardId,
  })

  // create a row!
  const row = new MessageActionRow()

  const embed = makeEmbed(``, interaction, false, false, {
    noAuthor: true,
    noFooter: true
  })
  await generateList(embed, guildMessages, currentIndex, onPage)

  let replyContent = {
    embeds: [embed],
  }

  if (guildMessages.length > onPage) {
    row.addComponents(forwardComponent)
    replyContent.components = [row]
  }

  await interaction.reply(replyContent)

  const embedMessage = await interaction.fetchReply()
  const collector = embedMessage.createMessageComponentCollector({
    filter: ({ user }) => user.id === interaction.member.id,
  })

  collector.on('collect', async (interaction) => {
    // Increase/decrease index
    interaction.customId === backId
      ? (currentIndex -= onPage)
      : (currentIndex += onPage)
    // Respond to interaction by updating message with new embed
    const embed = makeEmbed(``, interaction, false, false, {
      noAuthor: true,
      noFooter: true
    })
    await generateList(embed, guildMessages, currentIndex, onPage)

    const row = new MessageActionRow()

    if (currentIndex) row.addComponents(backComponent)
    if (currentIndex + onPage < guildMessages.length)
      row.addComponents(forwardComponent)

    await interaction.update({
      embeds: [embed],
      components: [row],
    })
  })
}
export let module = {
  name: 'top',
  description: 'Узнать топ уровней',
  options: [],
  function: func,
}
