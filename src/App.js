import React, { useEffect, useState } from 'react';
import user_image from './147144.png';
import './App.css';
import ChatLogic from './services/ChatLogic';
import ResultPage from './services/resultPage.tsx';

function App() {
  return (
    <body className="App">
      <ResultPage />
    </body>
  );
}

export default App;