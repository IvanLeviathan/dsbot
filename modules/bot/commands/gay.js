import Discord from 'discord.js'
import { getRandomGifFromTenor, makeEmbed } from '../helpers.js'

const tenorUrl = 'https://tenor.com/search/gachimuchi-gifs'

const func = async (interaction, options) => {
  const who = options.getUser('who')
  const max = 100
  const randomInt = Math.floor(Math.random() * Math.floor(max)) + 1

  let name = interaction.member.nickname
    ? interaction.member.nickname
    : interaction.member.user.username

  if (!!who) name = who.username

  let text = `glsl\n# ${name} - гей на ${randomInt}%!`

  const embed = makeEmbed(text, interaction, false, true, {
    noAuthor: true,
    noFooter: true
  })

  const gifImage = await getRandomGifFromTenor(tenorUrl)
  if(!!gifImage)
    embed.setImage(gifImage)

  interaction.reply({
    embeds: [embed],
  })
}
export let module = {
  name: 'gay',
  description: 'Узнать насколько ты гей',
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
