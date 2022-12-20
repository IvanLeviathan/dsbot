import Discord from 'discord.js'
import { getStats } from '../../../controllers/stats/index.js'
import {
  cutArrayToEmbedBlocksSegments,
  filterStatsForServer,
  makeEmbed,
} from '../helpers.js'
const func = async (interaction, options) => {
  const allStats = await getStats()
  const serverStats = await filterStatsForServer(
    allStats,
    interaction.guild.id,
    new Date(),
  )
  let usersStat = []
  await Promise.all(
    serverStats.map(async (serverStat) => {
      const name = await serverStat.name
      usersStat.push(name)
    }),
  )
  usersStat = [...new Set(usersStat)]
  const embed = makeEmbed(`Были сегодня:`, interaction, false, false)

  const segments = cutArrayToEmbedBlocksSegments(usersStat)
  segments.forEach((segment) => {
    embed.addField('\u200b', '```' + segment + '```')
  })

  await interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'stat',
  description: 'Вывод статистики',
  options: [],
  function: func,
}
