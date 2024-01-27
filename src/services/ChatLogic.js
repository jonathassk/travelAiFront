import React, { useEffect, useState } from 'react';
import ChatView from '../components/ChatView';
import { useTypingEffect } from '../utils/typingeffect';
import io from 'socket.io-client';

function ChatLogic() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setMessages([
      {
        text: 'Olá, sou seu assistente de viagem, voce poderia me informar seu nome?',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  useEffect(() => {
    connectAndSendData();
  }, []);

  function connectAndSendData() {
    const socket = io('https://tt8v0tezs8.execute-api.sa-east-1.amazonaws.com/production/');

    // Connect to the socket server
    socket.on('connect', () => {
      console.log('Connected to the socket server');
      
      // Send data to the server
      socket.emit('find_airport', { message: 'Hello, server!' });
    });

    // Handle received data from the server
    socket.on('find_airport', (data) => {
      console.log('Received data from the server:', data);
    });

    // Disconnect from the socket server
    socket.on('disconnect', () => {
      console.log('Disconnected from the socket server');
    });
  }

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