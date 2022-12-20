import { makeEmbed } from '../helpers.js'
import Discord from 'discord.js'
import axios from 'axios'
import { client } from '../index.js'

export const DS_API_ENDPOINT = 'https://discord.com/api/v8'
const ACTIVITIES = [
  {
    id: '755827207812677713',
    name: 'Poker Night',
  },
  {
    id: '773336526917861400',
    name: 'Betrayal.io',
  },
  {
    id: '880218394199220334',
    name: 'Watch Together',
  },
  {
    id: '814288819477020702',
    name: 'Fishington.io',
  },
  {
    id: '832012774040141894',
    name: 'Chess In The Park',
  },
  // {
  //   id: '879864070101172255',
  //   name: 'Sketchy Artist'
  // },
  // {
  //   id: '879863881349087252',
  //   name: 'Awkword'
  // },
  // {
  //   id: '878067389634314250',
  //   name: 'Doodle Crew'
  // },
  {
    id: '902271654783242291',
    name: 'Sketch Heads',
  },
  {
    id: '879863686565621790',
    name: 'Letter League',
  },
  {
    id: '879863976006127627',
    name: 'Word Snacks',
  },
  {
    id: '852509694341283871',
    name: 'SpellCast',
  },
  {
    id: '832013003968348200',
    name: 'Checkers In The Park',
  },
  {
    id: '832025144389533716',
    name: 'Blazing 8s',
  },
  {
    id: '945737671223947305',
    name: 'Putt Party',
  },
  {
    id: '903769130790969345',
    name: 'Land-io',
  },
]

const activitiesToOption = () => {
  return ACTIVITIES.map((act) => {
    return {
      name: act.name,
      value: act.id,
    }
  })
}

const func = async (interaction, options) => {
  const optChannel = options.getChannel('channel')
  const optActivity = options.getString('activity')

  if (optChannel.type !== 'GUILD_VOICE')
    return await interaction.reply({
      content: 'Разрешены только голосовые каналы',
    })
  if (!optActivity)
    return await interaction.reply({
      content: 'Не указано мероприятие',
    })

  const headers = {
    Authorization: `Bot ${client.token}`,
    'Content-Type': 'application/json',
  }

  const data = JSON.stringify({
    max_age: 86400,
    max_uses: 0,
    target_application_id: optActivity,
    target_type: 2,
    temporary: false,
    validate: null,
  })

  const resp = await axios
    .post(`${DS_API_ENDPOINT}/channels/${optChannel.id}/invites`, data, {
      headers,
    })
    .then((response) => {
      if (response.data?.error || !response.data?.code) return false
      return response.data
    })
    .catch((e) => {
      console.log(e)
      return false
    })

  let messageContent
  if (!!resp) {
    const appName = resp.target_application.name
    const code = resp.code
    messageContent = `[Кликните что-бы запустить мероприятие "${appName}" в канале "${optChannel.name}"](https://discord.gg/${code})`
    // messageContent = `https://discord.com/invite/${code}`
  } else {
    messageContent = 'Не получилось создать мероприятие 😢'
  }

  interaction.reply({
    content: messageContent,
  })
}

export let module = {
  name: 'activity',
  description: 'Создать или присоединиться к мероприятию в голосовом канале',
  options: [
    {
      name: 'channel',
      description: 'Голосовой канал',
      required: true,
      type: Discord.Constants.ApplicationCommandOptionTypes.CHANNEL,
      channel_types: [2],
    },
    {
      name: 'activity',
      description: 'Мероприятие',
      required: true,
      type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
      choices: activitiesToOption(),
    },
  ],
  function: func,
}
