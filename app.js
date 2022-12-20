import express from "express";
import {} from "dotenv/config";
import events from "events";
import { syncModel } from "./utils/models/index.js";
import Discord from "discord.js";
import botStart from "./modules/bot/index.js";
import apiRequest from "./modules/api/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import https from "https";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

events.EventEmitter.prototype._maxListeners = 100;
process.env.TZ = "UTC";

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const PORT = process.env.PORT || 5000;

const botToken =
  process.env.DEV === "true"
    ? process.env.BOT_TOKEN_DEV
    : process.env.BOT_TOKEN;
const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING",
  ],
  partials: [
    "CHANNEL", // Required to receive DMs
  ],
});

app.use(
  express.json({
    extended: true,
  })
);

app.use(express.static(__dirname + "/view/build"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/view/build/index.html"));
});

app.get("/api", async (req, res) => {
  let answer = await apiRequest(req.query);

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(answer));
});

async function start() {
  try {
    https
      .createServer(
        {
          key: fs.readFileSync("privateKey.key"),
          cert: fs.readFileSync("certificate.crt"),
        },
        app
      )
      .listen(PORT, () => {
        console.log(`Server start on ${PORT}`);
      });
    // app.listen(PORT, () => {
    //   console.log(`Server start on ${PORT}`);
    // });
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
}
(async () => {
  //connect base
  await syncModel();

  //start express
  await start();

  //start bot actions
  botStart(client, botToken, Discord);
})()

