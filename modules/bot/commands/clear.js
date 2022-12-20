import Discord from 'discord.js'
import { declOfNum, makeEmbed } from '../helpers.js'
const func = async (interaction, options) => {
  let messagesCountOption = options.getInteger('count')

  if (messagesCountOption > 100 || !messagesCountOption) messagesCountOption = 100
  // const { size } = await interaction.channel.bulkDelete(messagesCountOption, true)
  const messages = await interaction.channel.messages.fetch({
    limit: messagesCountOption,
  })
  const { size } = messages

  messages.forEach((message) => message.delete().catch((e) => console.log(e)))

  await interaction.reply({
    embeds: [
      makeEmbed(
        `glsl\nУдалено ${size} ${declOfNum(size, [
          'сообщение',
          'сообщения',
          'сообщений',
        ])}`,
        interaction,
      ),
    ],
  })

  const message = await interaction.fetchReply()
  setTimeout(() => message.delete().catch((e) => console.log(e)), 5000)
}

export let module = {
  name: 'clear',
  description: 'Очистить сообщения',
  options: [
    {
      name: 'count',
      description: 'Количество сообщений',
      required: false,
      type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
    },
  ],
  function: func,
}
