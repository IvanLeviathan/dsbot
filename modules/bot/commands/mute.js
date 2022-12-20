import Discord from 'discord.js'
import { muteUser } from '../../../controllers/mute/index.js'
import { declOfNum, isUserHavePermissions, makeEmbed } from '../helpers.js'

const func = async (interaction, options) => {
  const who = options.getUser('who')
  const minutes = options.getInteger('minutes')

  const perms = await isUserHavePermissions(interaction.member, ['ADMINISTRATOR', 'MANAGE_MESSAGES'])
  if(!perms)
    return interaction.reply({
      content: `Недостаточно прав`,
      ephemeral: true
    })
  

  const mute = await muteUser(interaction.guild.id, who.id, minutes)
  let embedText =
    'Ошибка при попытке замутить пользователя, попробуйте еще раз.'
  if (mute)
    embedText = `Пользователь ${who} замучен на ${minutes} ${declOfNum(
      minutes,
      ['минуту', 'минуты', 'минут'],
    )}`

  interaction.reply({
    embeds: [makeEmbed(embedText, interaction, false, false)],
  })
}
export let module = {
  name: 'mute',
  description: 'Замутить пользователя',
  options: [
    {
      name: 'who',
      description: 'Кого',
      required: true,
      type: Discord.Constants.ApplicationCommandOptionTypes.USER,
    },
    {
      name: 'minutes',
      description: 'Количество минут',
      required: true,
      type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
    },
  ],
  function: func,
}
