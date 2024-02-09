import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import ChatView from '../components/ChatView';
import { useTypingEffect } from '../utils/typingeffect';
import createWebSocket from '../utils/socketConfig';

const URL = 'wss://tt8v0tezs8.execute-api.sa-east-1.amazonaws.com/production/';
const socket = new WebSocket(URL);
function ChatLogic() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [step, setStep] = useState('');

  const [state, dispatch] = useReducer(reducer, {name: '', departure: [], destination: [], date: Date.now(), returnDate: Date.now()});

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [airport, setAirport] = useState('');
  const [departure, setDeparture] = useState([]);
  const [destination, setDestination] = useState('');
  const [accommodation, setAccommodation] = useState('');
  
  useEffect(() => {
    
    setMessages([
      {
        text: 'Olá, sou seu assistente de viagem, voce poderia me informar seu nome?',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    
    socket.onopen = () => {
      console.log('connected on websocket server!');
    }

    socket.onmessage = (event) => {
      if (event.data.trim() === '') return;
      let newMessage;

      try {
        const jsonData = JSON.parse(event.data);
        if (jsonData && jsonData.step) setStep(jsonData.step);
        if (jsonData && jsonData.status) setStatus(jsonData.status);
        if (jsonData && jsonData.message) {
          newMessage = {
            text: jsonData.message,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
        } else {
          console.log("A mensagem não contém um campo 'message' válido.");
          return;
        }
        if (newMessage.text !== '') setMessages(prevMessages => [...prevMessages, newMessage]);
        if (jsonData.step === "airports_defined" && jsonData.status === "choosing_airport_departure") {
          const editedDeparture = cityData(jsonData.departure);
          dispatch({ type: 'setDeparture', payload: jsonData.departure });
          createMessageOptionsAirports(editedDeparture);
        }
      } catch (error) {
        console.error("Erro ao fazer o parsing da string JSON:", error);
        return;
      }
      
      
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

  function reducer(state, action) {
    switch (action.type) {
      case 'setDeparture':
        return { ...state, departure: action.payload };
      case 'setDestination':
        return { ...state, destination: action.payload };
      case 'filterDeparture':
        return { ...state, departure: action.payload };
      default:
        return state;
    }
  }

  const cityData = data => {
    let cont = 1;
    const resultadoFront = data.map((item) => {
      return {
        skyId: item.skyId,
        entityId: item.entityId,
        entityType: item.navigation.entityType,
        localizedName: item.navigation.localizedName,
        suggestionTitle: item.presentation.suggestionTitle,
        cont: cont++,
      }
    });
    return resultadoFront;
  }

  const createMessageOptionsAirports = data => {
    try {
      data.forEach(item => {
        const options = `${item.skyId} - ${item.suggestionTitle}`;
        const newMessage = {
          text: options, // Array de strings
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      });
       
    } catch (error) {
      console.error("Erro ao fazer o parsing da string JSON:", error);
      return;
    } 
  }

  const handleSendClick = () => {
    const newMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([...messages, newMessage]);

    if (name === '') {
      setMessages([...messages, newMessage, {
        text: `Ola ${inputText}, Você gostaria de incluir os voos de ida e volta no seu orçamento de viagem?`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setName(inputText);
      setInputText(''); 
      return;
    }

    if (airport === '') { // pergunta se deseja incluir voos de ida e volta
      setMessages([...messages, newMessage]);
      const data = {
        action: 'ensure_have_airport',
        awnser: inputText,
      }
      setAirport(inputText);
      socket.send(JSON.stringify(data));
    } else if (step === "flights" && status === true) {
      const data = {
        action: 'find_cities',
        departure: null,
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
      setInputText(''); 
    } else if (step === "flights" && status === false) {
      const data = {
        action: 'ensure_need_accommodation',
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'airports_defined' && status === 'choosing_airport_departure') {
      
      const filtered = state.departure.filter(item => item.skyId === inputText)
      console.log('filtered', filtered)
      if (filtered.length === 0) {
        setMessages([...messages, newMessage, {
          text: 'Por favor, escolha um aeroporto válido. (use as siglas indicadas)',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }
      dispatch({ type: 'filterDeparture', payload: filtered });
      setInterval(() => {
        const data = {
          action: 'find_airport',
          departure: filtered,
          destination: null,
        }
      socket.send(JSON.stringify(data));
      }, 400);
      
    } else if (step === 'airports_defined' && status === 'completed_departure') {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'find_cities',
        awnser: inputText,
        departure: departure,
      }
      setDeparture(inputText);
      socket.send(JSON.stringify(data));
    } else if (step === 'airports_defined' && status === 'choosing_airport_destination') {
      const data = {
        action: 'findAirport',
        departure: departure.find(item => item.skyId === inputText),
        destination: destination.find(item => item.skyId === inputText),
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'airports_defined' && status === 'completed_destination') {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'ensure_need_accommodation',
        awnser: inputText,
      }
      setAccommodation(inputText);
      socket.send(JSON.stringify(data));
    }
    setInputText(''); 
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