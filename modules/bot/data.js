import ServerSettingsModel from '../../models/server_settings/index.js'

export let legionsSettingsFromDb = {}

export async function getDataFromDb() {
  const legionsSettings = await ServerSettingsModel.find()
  let beautyLegionsSettings = {}
  legionsSettings.forEach((elem) => {
    beautyLegionsSettings[elem.guildId] = elem
  })
  legionsSettingsFromDb = beautyLegionsSettings
  return {
    legionsSettings: beautyLegionsSettings,
  }
}
