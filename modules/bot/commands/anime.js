import Discord from 'discord.js'
import { makeEmbed } from '../helpers.js'
import randomAnime from 'random-anime'

const func = async (interaction, options) => {
  const who = options.getUser('who')
  const nsfw = await randomAnime.anime()

  let name = interaction.member.nickname
    ? interaction.member.nickname
    : interaction.member.user.username

  if (!!who) name = who.username

  let text = `glsl\n# ${name} - это ты`

  const embed = makeEmbed(text, interaction, false, true, {
    noAuthor: true,
    noFooter: true
  })
  embed.setImage(nsfw)
  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'anime',
  description: 'Узнать кто ты из аниме девачек',
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
