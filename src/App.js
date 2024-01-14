import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className='title'> travel AI-ssistant </h1>
      </header>

      <body>
        <div className='chat'>
          <div className='chat_header'>
            <div className='chat_info'>
              <p className='ai_name'>Assistant Name</p>
              <p className='ai_status'>your travel assistant</p>
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App;
