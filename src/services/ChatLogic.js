import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChatView from '../components/ChatView';
import { useTypingEffect } from '../utils/typingeffect';

const URL = 'wss://tt8v0tezs8.execute-api.sa-east-1.amazonaws.com/production/';
const socket = new WebSocket(URL);
function ChatLogic() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    
    setMessages([
      {
        text: 'Olá, sou seu assistente de viagem, voce poderia me informar seu nome?',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    
    socket.onopen = () => {
      console.log('trying to connect');
    }

    socket.onmessage = (event) => {
      const newMessage = {
        text: event.data,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleSendClick = () => {
    const newMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    if (name === '') {
      setMessages([...messages, newMessage, {
        text: `Ola ${inputText}, Você gostaria de incluir os voos de ida e volta no seu orçamento de viagem?`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setName(inputText);
    } else {
      setMessages([...messages, newMessage]);
    }
    setInputText('');
    const message = {
      action: 'find_airport'
    }
    socket.send(JSON.stringify(message));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  return (
    <ChatView
      text={text}
      text2={text2}
      messages={messages}
      inputText={inputText}
      setInputText={setInputText}
      handleSendClick={handleSendClick}
      handleKeyDown={handleKeyDown}
    />
  );
}

export default ChatLogic;