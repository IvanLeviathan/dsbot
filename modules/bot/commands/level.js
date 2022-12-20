import { getUserMessagesCount } from '../../../controllers/levels/index.js'
import { makeEmbed } from '../helpers.js'
import { calcUserLevel } from '../levels.js'
import Discord from 'discord.js'

const func = async (interaction, options) => {
  const who = options.getUser('who')
  let messagesCount = await getUserMessagesCount(
    interaction.guild.id,
    !!who ? who.id : interaction.member.id,
  )

  let name = interaction.member.nickname
    ? interaction.member.nickname
    : interaction.member.user.username

  if (!!who) name = who.username

  if (!messagesCount) messagesCount = 1

  const userLevel = calcUserLevel(messagesCount)
  
  const embed = makeEmbed(`glsl\n# ${name}\n${userLevel} уровень`, interaction, false, true, {
    noFooter: true,
    noAuthor: true
  })

  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'level',
  description: 'Узнать уровень',
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
