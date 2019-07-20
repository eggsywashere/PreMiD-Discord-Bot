//* Load .env file
import { config } from "dotenv";
config();
import * as Discord from "discord.js";
import { error, success } from "./util/debug";
import moduleLoader from "./util/moduleLoader";
import { connect, MongoClient } from "./database/client";

var {
  jrModerator,
  moderator,
  administrator,
  developer
} = require("./roles.json");

//* Create new client & set login presence
var client = new Discord.Client({
  presence:
    process.env.NODE_ENV == "dev"
      ? {
          status: "dnd",
          activity: {
            name: "devs code",
            type: "WATCHING"
          }
        }
      : {
          status: "online",
          activity: {
            name: "Timeraa",
            type: "LISTENING"
          }
        }
});

//* Commands, Command aliases, Command permission levels
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.elevation = (message: Discord.Message) => {
  //* Permission level checker
  var permlvl: Number = 0;

  if (!message.member) return 0;

  //* Jr Mod
  if (message.member.roles.has(jrModerator)) permlvl = 1;
  //* Mod
  if (message.member.roles.has(moderator)) permlvl = 2;
  //* Admin
  if (message.member.roles.has(administrator)) permlvl = 3;
  //* Dev
  if (message.member.roles.has(developer)) permlvl = 4;

  //* Return permlvl
  return permlvl;
};

//! Make sure that database is connected first then proceed
(async () => {
  //* Connect to Mongo DB
  await connect()
    .then(_ => success("Connected to the database"))
    .catch((err: Error) => {
      error(`Could not connect to database: ${err.name}`);
      process.exit();
    });

  client
    .login(
      process.env.NODE_ENV == "dev" ? process.env.TOKEN_BETA : process.env.TOKEN
    )
    .then(() => {
      moduleLoader(client);
    });
})().catch(error);

export { client };
