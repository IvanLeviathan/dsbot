import { makeEmbed } from '../helpers.js'

const func = async (interaction, options) => {
  const embed = makeEmbed(``, interaction, false, true, {
    noFooter: true,
    noAuthor: true
  })

  // get commands list
  if (interaction.client?.commands) {
    let commandsList = ''
    interaction.client?.commands.forEach((command, i) => {
      let commandName = i.toUpperCase()
      command.options.forEach((option, i) => {
        if (option.required)
          commandName += ` (${
            option.name
          }: ${option.description.toLowerCase()})`
        else
          commandName += ` [${
            option.name
          }: ${option.description.toLowerCase()}]`
      })
      commandsList += `/${commandName} - ${command.description.toLowerCase()}\n`
    })
    embed.addField('Список команд:', '```ml\n' + commandsList + '\n```')
  }

  
  embed.addField('\u200b', `[Панель управления](${process.env.BOT_HOSTING_URL})\n[Сервер поддержки](https://discord.gg/eMauW6ZmhJ)`)
  embed.addField('Разработчик:', '<@365902467549888522>')

  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'help',
  description: 'Помощь',
  options: [],
  function: func,
}
