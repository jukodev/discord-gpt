const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

let messages: Messages[] = [];

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY
});
const openai = new OpenAIApi(configuration);

async function askGPT(message: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    messages.push({ role: 'user', content: message });
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages
    });
    try {
      const answer = completion.data.choices[0].message.content;
      messages.push({ role: 'assistant', content: answer });
      resolve(answer);
    } catch (err: unknown) {
      reject(err);
    }
  });
}

function newChat(): void {
  messages = [];
}

interface Messages {
  role: Role;
  content: string;
}

type Role = 'system' | 'user' | 'assistant';

module.exports = { askGPT, newChat };
