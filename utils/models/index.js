import mongoose from 'mongoose'
import { networkInterfaces } from 'os'

export async function syncModel() {
  try {
    await mongoose.connect(
      process.env.DEV === 'true'
        ? process.env.MONGO_URI_DEV
        : process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )
    console.log('Success connect to DB')
  } catch (e) {
    console.log('Error connect to DB')
    console.log(e)

    const nets = networkInterfaces()
    const results = Object.create(null) // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = []
          }
          results[name].push(net.address)
        }
      }
    }
    console.log(results)
  }
}
