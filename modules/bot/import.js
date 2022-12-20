import legionsSettings from './imports/legions.js'
import { createOrUpdateSettings } from '../../controllers/settings/index.js'

async function importLegions() {
  if (!!legionsSettings) {
    legionsSettings.forEach((curServerLoop) => {
      curServerLoop.botLegion = `${curServerLoop.botLegion}`
      createOrUpdateSettings(curServerLoop.id, curServerLoop)
    })
  }
}

export default async function imports() {
  importLegions()
}
