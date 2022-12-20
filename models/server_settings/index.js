import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: true, unique: true },
  botChannelId: { type: String, default: '' },
  botColor: { type: String, default: '' },
  botFooter: { type: String, default: '' },
  botLegion: { type: String, default: '' },
  botLegionsChannelId: { type: String, default: '' },
  botLegionServerIP: { type: String, default: '' },
  botLegionServerPort: { type: String, default: '' },
  botThumb: { type: String, default: '' },
  botTitle: { type: String, default: '' },
  battleMetricsUrl: { type: String, default: '' },
  greetingsText: { type: String, default: '' },
  greetingsChannel: { type: String, default: '' },
  greetingsImage: { type: String, default: '' },
})
const ServerSettingsModel = model('serversettings', schema)
export default ServerSettingsModel
