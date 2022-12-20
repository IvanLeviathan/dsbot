import { makeEmbed } from '../helpers.js'

const func = async (interaction, options) => {
  const timeTaken = Math.abs(Date.now() - interaction.createdTimestamp)
  const embed = makeEmbed(
    `glsl\nPong! Задержка #${timeTaken}ms`,
    interaction,
    false,
    true,
    {
      noFooter: true,
      noAuthor: true,
    },
  )
  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'ping',
  description: 'Проверить пинг до серверов дискорда',
  options: [],
  function: func,
}
