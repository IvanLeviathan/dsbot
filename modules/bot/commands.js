import { addLog } from '../../controllers/server_logs/index.js'
import { isServerBlackListed, isUserBlackListed } from './blacklist.js'
import { applyBotSlashCommands, loadBotSlashCommands } from './helpers.js'
import { isUserMuted } from './mute.js'

export default function commands(client, Discord) {
  client.on('ready', async () => {
    client.commands = new Discord.Collection()

    await loadBotSlashCommands(client)
    applyBotSlashCommands(client)
  })

  //slash commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return
    if (!interaction.guild)
      return interaction.reply({
        content: 'Команды недоступны в личных сообщениях',
      })

    //check for blacklist
    const userBlackListed = await isUserBlackListed(interaction.member?.id)
    const serverBlackListed = await isServerBlackListed(interaction.guild?.id)
    if (userBlackListed || serverBlackListed) {
      const content = serverBlackListed
        ? `Сервер **${interaction.guild.name}** находится в блок-листе`
        : `Пользователь **${interaction.member.user.username}** находится в блок-листе`
      interaction.reply({
        content: content,
        ephemeral: true,
      })
      return
    }

    //check for mute
    const isMuted = await isUserMuted(
      interaction.guild?.id,
      interaction.member?.id,
    )
    if (isMuted) {
      interaction.reply({
        content: `Вы замучены на сервере`,
        ephemeral: true,
      })
      return
    }

    const { commandName, options } = interaction
    const commandFile = client.commands.get(commandName)
    console.log(
      `Command used ${commandName} by ${interaction.member.user.username}`,
    )
    if (commandFile) commandFile.function(interaction, options)
    addLog(
      interaction.guild.id,
      interaction.member.id,
      `Использование команды ${commandName}`,
      'COMMAND_USED',
    )
  })
}
