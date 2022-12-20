import { isImage, makeEmbed } from '../helpers.js'
import Discord from 'discord.js'
import { getUserInfo } from '../../../controllers/info/index.js'

const func = async (interaction, options) => {
  const who = options.getUser('who')

  const name = who?.id ? who.username : interaction.member.user.username
  const info = await getUserInfo(interaction.guild.id, who?.id ? who.id : interaction.member.id)

  const embed = makeEmbed(
    ``,
    interaction,
    false,
    false,
    {
      noFooter: true,
      noAuthor: true,
    },
  )
  
  let description = `**${name}**:\n`
  description += info?.text ? info?.text : "Данные не найдены"
  embed.setDescription(description)

  if(!!info.image && isImage(info.image))
    embed.setImage(info.image)

  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'info',
  description: 'Информация о пользователе',
  options: [
    {
      name: 'who',
      description: 'Про кого узнать',
      required: false,
      type: Discord.Constants.ApplicationCommandOptionTypes.USER,
    },
  ],
  function: func,
}
