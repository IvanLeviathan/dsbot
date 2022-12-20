import {
  filterPlayersByPartOfName,
  getServerInfo,
  getServerInfoFromBattlemetrics,
  makeEmbed,
  makeOnlineEmbed,
  prettifyGamedigAnswer,
  sendMessageToChannel,
} from '../helpers.js'
import { legionsSettingsFromDb } from '../data.js'

const func = async (interaction, options) => {
  const curServerSettings = legionsSettingsFromDb[interaction.guild.id]

  if (!curServerSettings)
    return interaction.reply({
      embeds: [
        makeEmbed(
          'Не заданы настройки для бота на данном сервере',
          interaction,
        ),
      ],
    })

  await interaction.reply({
    content: 'Пытаюсь получить информацию...',
  })
  const interactionReply = await interaction.fetchReply()

  interaction.channel.sendTyping()

  let serverData = await getServerInfo(
    curServerSettings.botLegionServerIP,
    curServerSettings.botLegionServerPort,
  )

  if (!serverData) {
    if (!!curServerSettings.battleMetricsUrl) {
      serverData = await getServerInfoFromBattlemetrics(
        curServerSettings.battleMetricsUrl,
      )
    }
  } else {
    serverData = prettifyGamedigAnswer(serverData)
  }

  if (!serverData) {
    const messageContent = {
      embeds: [makeEmbed('Не удалось получить данные', interaction)],
    }
    await sendMessageToChannel(interaction.channel, messageContent)
  } else {
    serverData.players = filterPlayersByPartOfName(
      serverData.players,
      curServerSettings.botLegion,
    )
    const embed = makeEmbed(``, interaction)
    makeOnlineEmbed(embed, serverData)
    const messageContent = {
      embeds: [embed],
    }
    await sendMessageToChannel(interaction.channel, messageContent)
  }

  await interactionReply.delete().catch((e) => console.log(e))
}
export let module = {
  name: 'online',
  description: 'Показать онлайн на сервере',
  options: [],
  function: func,
}
