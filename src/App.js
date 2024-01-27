import React, { useEffect, useState } from 'react';
import user_image from './147144.png';
import './App.css';
import ChatLogic from './services/ChatLogic';

function App() {
  return (
    <body className="App">
      <ChatLogic />
    </body>
  );
}

export default App;