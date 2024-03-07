import React from 'react';
import user_image from '../147144.png';
import ChatComponentMessage from '../chatComponentMessage';
import { Navigate, Link } from "react-router-dom";

function ChatView({
  text,
  text2,
  messages,
  inputText,
  setInputText,
  handleSendClick,
  handleKeyDown
}) {
  return (
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
        <input
          type='text'
          className='chat_input'
          placeholder='Type a message...'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className='chat_send_button' onClick={handleSendClick}>SEND</button>
        <Link to="/result">Result</Link>
      </div>
    </div>
  );
}

export default ChatView;
