const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const convos = new Map<string, Messages[]>();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY
});
const openai = new OpenAIApi(configuration);

async function askGPT(message: string, convo: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    const messages = convos.get(convo) ?? [];
    messages.push({ role: 'user', content: message });
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages
    });
    try {
      const answer = completion.data.choices[0].message.content;
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

module.exports = { askGPT };
