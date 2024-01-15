import user_image from './147144.png';
import './App.css';
import ChatComponentMessage from './chat_component_message';

function App() {
  return (
    <div className="App">


      <body>
        <div className='chat'>
          <div className='chat_header'>
            <div className='header_photo'>
              <img src={user_image} className="photo_header_img" alt="logo" />
            </div>
            <div className='header_info'>
              <p className='ai_name'>Assistant Name</p>
              <p className='ai_status'>your travel assistant</p>
            </div>
          </div>
          <ChatComponentMessage />

        </div>
      </body>
    </div>
  );
}

export default App;
