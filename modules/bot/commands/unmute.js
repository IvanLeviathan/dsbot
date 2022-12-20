import Discord from 'discord.js'
import { unmuteUser } from '../../../controllers/mute/index.js'
import { declOfNum, makeEmbed, isUserHavePermissions } from '../helpers.js'

const func = async (interaction, options) => {
  const who = options.getUser('who')

  const perms = await isUserHavePermissions(interaction.member, ['ADMINISTRATOR', 'MANAGE_MESSAGES'])
  if(!perms)
    return interaction.reply({
      content: `Недостаточно прав`,
      ephemeral: true
    })

  const mute = await unmuteUser(interaction.guild.id, who.id)
  let embedText =
    'Ошибка при попытке размутить пользователя, попробуйте еще раз.'
  if (mute) embedText = `Пользователь ${who} размучен`

  interaction.reply({
    embeds: [makeEmbed(embedText, interaction, false, false)],
  })
}
export let module = {
  name: 'unmute',
  description: 'Размутить пользователя',
  options: [
    {
      name: 'who',
      description: 'Кого',
      required: true,
      type: Discord.Constants.ApplicationCommandOptionTypes.USER,
    },
  ],
  function: func,
}
