
import React from 'react';

const ChatComponentMessage = ({ message, time, sender }) => { // Destructure the props
    if (sender === 'user') {
        return (
                <div className='message_user'>
                    <div className='hours_message_user'>
                        <p className='hours'>{time}</p>  
                    </div>
                    <div className='chat_message_user'>
                        <p>{message}</p>
                    </div>
                </div>
        )        
    } else {
        return (    
            <div className='message_assistant'>
                <div className='chat_message_assistant'>
                    <p>{message}</p>
                </div>
                <div className='hours_message_user'>
                    <p className='hours'>{time}</p>  
                </div>
            </div>   
        )
    }
};

export default ChatComponentMessage;
