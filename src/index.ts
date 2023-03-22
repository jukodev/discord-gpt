import { Channel } from 'discord.js';
const { askGPT } = require('./gpt');

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
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  console.log(message.channel.type + '' + message.author);
  if (
    message.author.bot === true ||
    (message.channelId !== process.env.CHANNEL_ID && message.channel.type === 0)
  ) {
    return;
  }
  if (message.content === '--newChat') {
    currentConvo = crypto.randomUUID().substring(0, 7);
    message.channel.send('Neue Konversation gestartet: ' + currentConvo);
    return;
  }
  message.channel.sendTyping();
  if (message.channel.type === 1) {
    askGPT(message.content, message.author)
      .then((ans: string) => {
        console.log(ans);
        message.channel.send(ans);
      })
      .catch((err: Error) => {
        console.log(err);
        message.channel.send(
          'Interner Server Error, starte eine neue Konversation mit "--newChat"'
        );
      });
  } else {
    askGPT(message.content, currentConvo)
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
  }
});
