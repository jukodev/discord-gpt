import { Channel } from 'discord.js';
const { askGPT } = require('./gpt');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.GuildMessages]
});
const process = require('process');

let channel: any;

require('dotenv').config();

process.title = 'discord-gpt';
client.login(process.env.DISCORD_KEY);

client.on('ready', () => {
  console.log(
    `Connected to discord as ${client.user.tag}, running as ${process.title}`
  );
  client.channels.fetch(process.env.DISCORD_CHANNEL).then((ch: Channel) => {
    channel = ch;
  });
});

client.on('messageCreate', async (message: any) => {
  console.log(message.content);
  if (message.author.bot) return;
  message.channel.sendTyping();

  askGPT(message.content)
    .then((ans: string) => {
      console.log(ans);
      channel.send(ans);
    })
    .catch((err: Error) => console.log(err));
});
