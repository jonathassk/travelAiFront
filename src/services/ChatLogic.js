import React, { useEffect, useReducer, useState } from 'react';
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

  const [state, dispatch] = useReducer(reducer, {name: '', departure: [], destination: [], date: "", returnDate: "", flights: [], hotels: [], activities: {}, city: "", days: 0, value: 0});

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [airport, setAirport] = useState('');
  const [departure, setDeparture] = useState([]);
  
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
        console.log('jsonData', jsonData)
        
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
        if (jsonData.status === "choosing_airport_departure" || jsonData.status === "completed_departure") {
          const editedDeparture = cityData(jsonData.departure);
          dispatch({ type: 'setDeparture', payload: jsonData.departure });
          if (jsonData.status === "choosing_airport_departure") createMessageOptionsAirports(editedDeparture);
        }
        if (jsonData.status === "completed_destination" || jsonData.status === "choosing_airport_destination") {
          const editedDestination = cityData(jsonData.destination);
          dispatch({ type: 'setDestination', payload: jsonData.destination });
          if (jsonData.status === "choosing_airport_destination") createMessageOptionsAirports(editedDestination);
        }
        if (jsonData.status === "waiting_return_date" && jsonData.step === "format_date") dispatch({ type: 'setDate', payload: jsonData.date });
        if (jsonData.status === "completed_return_date" && jsonData.step === "format_date") {
          dispatch({ type: 'setReturnDate', payload: jsonData.returnDate });
          const data = {
            action: 'find_flights',
            departure: state.departure,
            destination: state.destination,
            date: state.date,
            returnDate: jsonData.returnDate,
          }
          socket.send(JSON.stringify(data));
        }
        if (jsonData.status === 'waiting_quantity_days' && jsonData.step === "create_activities") dispatch({ type: 'setCity', payload: jsonData.value });

        if (jsonData.status === 'waiting_value' && jsonData.step === "create_activities") {
          dispatch({ type: 'setDays', payload: jsonData.value });
        }
        if (jsonData.status === 'completed_activity' && jsonData.step === "create_activities") {
          jsonData.result = jsonData.value.replace(/\n/g, '');
          const parseValue = JSON.parse(jsonData.result);
          const parsed = JSON.parse(parseValue);
          dispatch({ type: 'setValue', payload: jsonData.price });
          dispatch({ type: 'setActivities', payload: parsed });
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
      case 'setDate':
        return { ...state, date: action.payload };
      case 'setReturnDate':
        return { ...state, returnDate: action.payload };
      case 'setName':
        return { ...state, name: action.payload };
      case 'setCity':
        return { ...state, city: action.payload };
      case 'setDays':
        return { ...state, days: action.payload };
      case 'setValue': 
        return { ...state, value: action.payload };
      case 'setActivities':
        return { ...state, activities: action.payload };
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
      dispatch({ type: 'setName', payload: inputText });
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
        action: 'find_activities',
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'airports_defined' && status === 'choosing_airport_departure') {
      const filtered = state.departure.filter(item => item.skyId === inputText.toUpperCase())
      if (filtered.length === 0) {
        setMessages([...messages, newMessage, {
          text: 'Por favor, escolha um aeroporto válido. (use as siglas indicadas)',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        }]);
        setInputText(''); 
        return;
      }
      dispatch({ type: 'filterDeparture', payload: filtered });
      
      const data = {
        action: 'find_airport',
        departure: filtered,
        destination: null,
      }
      console.log('data', data)
      socket.send(JSON.stringify(data));
      
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
      const filtered = state.destination.filter(item => item.skyId === inputText.toUpperCase())
      if (filtered.length === 0) {
        setMessages([...messages, newMessage, {
          text: 'Por favor, escolha um aeroporto válido. (use as siglas indicadas)',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        }]);
        setInputText(''); 
        return;
      }
      const data = {
        action: 'find_airport',
        departure: departure,
        destination: filtered,
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'airports_defined' && status === 'completed_destination') {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'format_date',
        awnser: inputText,
        field: 'date'
      }
      socket.send(JSON.stringify(data));
    setInputText(''); 
    } else if (step === 'format_date' && status === 'waiting_return_date') {
      setMessages([...messages, newMessage]);
      let data = {
        action: 'format_date',
        awnser: inputText,
        field: 'returnDate'
      }
      console.log('IT', inputText.toLowerCase())
      if (inputText.toLowerCase() === 'no' || inputText.toLowerCase() === 'não' || inputText.toLowerCase() === 'nao' || inputText.toLowerCase() === 'n') {
        data = {
          action: 'find_flights',
          departure: state.departure,
          destination: state.destination,
          date: state.date,
          returnDate: null,
        }
      }
      console.log(JSON.stringify(data))
      socket.send(JSON.stringify(data));
    } else if (step === 'create_activities' && status === true) {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'find_activities',
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'create_activities' && status === "waiting_quantity_days") {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'find_activities',
        city: state.city,
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'create_activities' && status === "waiting_value") {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'find_activities',
        city: state.city,
        days: state.days,
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
    
    }
    setInputText(''); 
    
  }


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