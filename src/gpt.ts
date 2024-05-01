import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import { sendMessage } from './index.js';
dotenv.config();
const convos = new Map<string, Messages[]>();

const ollama = new Ollama({ host: process.env.OLLAMA_HOST });
let currentMessage: string = '';
let busy = false;

export async function askLlama(message: string, convo: string): Promise<void> {
  const messages = convos.get(convo) ?? [];
  messages.push({ role: 'user', content: message });

  try {
    const response = await ollama.chat({
      model: 'llama3',
      messages,
      stream: true
    });
    busy = true;
    messages.push({ role: 'assistant', content: '' });

    for await (const part of response) {
      const { role, content } = part.message;
      if (role === 'assistant') {
        currentMessage += content;
        if (part.message.content.includes('\n')) {
          sendMessage(currentMessage);
          currentMessage = '';
          messages[messages.length - 1].content += currentMessage;
        }
        sendMessage(content);
      }
    }
    currentMessage = '';
    busy = false;

    convos.set(convo, messages);
  } catch (err: unknown) {
    console.error(err);
    sendMessage(
      'Interner Server Error, starte eine neue Konversation mit "--newChat"'
    );
  }
}

export function isBusy(): boolean {
  return busy;
}

interface Messages {
  role: Role;
  content: string;
}

type Role = 'system' | 'user' | 'assistant';
