import { Channel } from 'discord.js';
const { askGPT, newChat } = require('./gpt');

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel, Partials.Message]
});
const process = require('process');

let channel: any;

let currentConvo: string;
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
  if (
    message.author.bot === true ||
    (channel.channelId !== process.env.CHANNEL_ID && message.guild !== undefined)
  ) {
    return;
  }
  if (message.content === '--newChat') {
    currentConvo = crypto.randomUUID().substring(0, 7);
    channel.send('Neue Konversation gestartet: ' + currentConvo);
  }
  message.channel.sendTyping();

  askGPT(message.content)
    .then((ans: string) => {
      console.log(ans);
      channel.send(ans);
    })
    .catch((err: Error) => {
      console.log(err);
      channel.send(
        'Interner Server Error, starte eine neue Konversation mit "--newChat"'
      );
    });
});
