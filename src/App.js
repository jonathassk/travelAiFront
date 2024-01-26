import user_image from './147144.png';
import './App.css';

import ChatComponentMessage from './chatComponentMessage';
import { useTypingEffect } from './hooks/typingeffect';
import { useEffect, useState } from 'react';

function App() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [name, setName] = useState('user');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        name: 'mr. flight',
        text: 'I am your travel assistant, ask me anything, I will try to help you...',
        sender: 'assistant',
        timestamp: '01:00'
      }
    ]);
  }, []);

  return (
    
      <body className="App">
        <div className='chat'>
          <div className='chat_header'>
            <div className='header_photo'>
              <img src={user_image} className="photo_header_img" alt="logo" />
            </div>
            <div className='header_info'>
              <p className='ai_name'>{text2}</p>
              <p className='ai_status'>{text}</p>
            </div>
          </div>
          <div className='chat_messages'>
            {messages.map((message, index) => (
              <ChatComponentMessage
                key={index}
                sender={message.sender}
                message={message.text}
                time={message.timestamp}
              />
            ))}
          </div>
          <div className='send_message_div'>
            <input type='text' className='chat_input' placeholder='Type a message...' />
            <button className='chat_send_button'>SEND</button>
          </div>
          

        </div>
      </body>
    
  );
}

export default App;
