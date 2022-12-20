import { legionsSettingsFromDb } from "./data.js";
import { isImage, sendMessageToChannel, makeEmbed } from "./helpers.js";

export default async function common(client){
  client.on('guildMemberAdd', async (member) => {
    if(member.user.bot) return
    const guildId = member.guild.id
    const curServerSettings = legionsSettingsFromDb[guildId]
    if(!curServerSettings?.greetingsChannel) return

    const channel = await client.channels.fetch(curServerSettings?.greetingsChannel).catch((e) => console.log(e))
    
    if(!!curServerSettings?.greetingsText || !!curServerSettings?.greetingsImage){
      const messageContent = {
        content : `${member}`
      }
      const embed = makeEmbed(``, false, curServerSettings, false)
      if(!!curServerSettings?.greetingsText){
        embed.setDescription(curServerSettings?.greetingsText)
      }
      if(!!curServerSettings?.greetingsImage && isImage(curServerSettings?.greetingsImage))
        embed.setImage(curServerSettings?.greetingsImage)
      messageContent.embeds = [embed]
      await sendMessageToChannel(channel, messageContent)
    }
  });
}