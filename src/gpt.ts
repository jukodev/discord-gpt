import { Ollama } from 'ollama';

const convos = new Map<string, Messages[]>();

const ollama = new Ollama({ host: process.env.OLLAMA_HOST });

export async function askLlama(
  message: string,
  convo: string
): Promise<string> {
  return await new Promise(async (resolve, reject) => {
    const messages = convos.get(convo) ?? [];
    messages.push({ role: 'user', content: message });

    try {
      const completion = await ollama.chat({
        model: 'llama3',
        messages
      });
      const answer = completion.message.content;
      messages.push({ role: 'assistant', content: answer });
      convos.set(convo, messages);
      resolve(answer);
    } catch (err: unknown) {
      reject(err);
    }
  });
}

interface Messages {
  role: Role;
  content: string;
}

type Role = 'system' | 'user' | 'assistant';
