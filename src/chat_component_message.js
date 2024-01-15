
import React from 'react';

const ChatComponentMessage = () => {
  return (
    <div>
        <div className='message_user'>
            <div className='chat_message_user'>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
            </div>
            <div className='hours_message_user'>
                <p className='hours'>05:20</p>  
            </div>
        </div>
        
        <div className='message_user'>
            <div className='hours_message_user'>
                <p className='hours'>05:20</p>  
            </div>
            <div className='chat_message_assistant'>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
            </div>
            
        </div>    
    </div>
  );
};

export default ChatComponentMessage;
