import Discord from 'discord.js'
import { makeEmbed } from '../helpers.js'
const func = async (interaction, options) => {
  const maxOption = options.getInteger('max')
  const max = maxOption || 100
  const randomInt = Math.floor(Math.random() * Math.floor(max)) + 1

  const embed = makeEmbed(
    `glsl\n# ${
      interaction.member.nickname
        ? interaction.member.nickname
        : interaction.member.user.username
    }\nвыбрасывает ${randomInt} из ${max}`,
    interaction,
    false,
    true,
    {
      noAuthor: true,
      noFooter: true,
    },
  )

  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'roll',
  description: 'Бросить кости и получить случайное число',
  options: [
    {
      name: 'max',
      description: 'Максимальное число',
      required: false,
      type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
    },
  ],
  function: func,
}
