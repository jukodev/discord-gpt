/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { askLlama } from './gpt.js';

import { Client, GatewayIntentBits, Partials, Channel } from 'discord.js';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config();
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

let channel: any;

let currentConvo: string;

process.title = 'discord-gpt';
await client.login(process.env.DISCORD_KEY);

client.on('ready', async () => {
  console.log(
    `Connected to discord as ${client.user!.tag}, running as ${process.title}`
  );
  await client.channels
    .fetch(process.env.DISCORD_CHANNEL!)
    .then((ch: Channel | null) => {
      channel = ch;
    });
});

client.on('messageCreate', async (message: any) => {
  if (
    message.author.bot === true ||
    (message.channelId !== process.env.DISCORD_CHANNEL &&
      message.channel.type === 0)
  ) {
    return;
  }
  if (message.content === '--newChat') {
    console.log('newChat');
    currentConvo = crypto.randomUUID().substring(0, 7);
    message.channel.send('Neue Konversation gestartet: ' + currentConvo);
    return;
  }
  message.channel.sendTyping();
  await askLlama(message.content, message.author);
});

export function sendMessage(msg: string) {
  channel.send(msg);
}
