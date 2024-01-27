import { Message } from "../interfaces/message";

const messages: Message[] = [];

const messageConfiguration = (text: string, sender: string): void => { 
  const message: Message = { text, sender, timestamp: Date.now() };
  messages.push(message);
  console.log(messages);
};

export default messageConfiguration;