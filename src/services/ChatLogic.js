import React, { useEffect, useReducer, useRef, useState } from 'react';
import ChatView from '../components/ChatView';
import AppState from '../services/mobxState.tsx';
import { useTypingEffect } from '../utils/typingeffect';
import { useNavigate } from "react-router-dom";


const URL = 'wss://tt8v0tezs8.execute-api.sa-east-1.amazonaws.com/production/';
const socket = new WebSocket(URL);
function ChatLogic() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [step, setStep] = useState('');
  const [state, dispatch] = useReducer(reducer, {name: '', departure: [], destination: [], date: "", returnDate: "", flights: [], hotels: [], activities: [], meals: {}, city: "", country: "", days: null, value: null, hasFlight: null});

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [airport, setAirport] = useState('');
  const [departure, setDeparture] = useState([]);

  let lastMessage = useRef(null);
  let stepsApplied = useRef({flights: false, activities: false, meals: false})
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        if (lastMessage.current === jsonData.message) return;
        lastMessage.current = jsonData.message;
        if (jsonData?.step) setStep(jsonData.step);
        if (jsonData?.status) setStatus(jsonData.status);
        if (jsonData?.message) {
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
        if (jsonData.step === "create_activities" && jsonData.status === true) dispatch({ type: 'setHasFlight', payload: false});
        if (jsonData.step === "flights" && jsonData.status === true) dispatch({ type: 'setHasFlight', payload: true})
        if (jsonData.step === "format_date" && jsonData.status === "waiting_return_date") dispatch({ type: 'setDate', payload: jsonData.date });
        if (jsonData.step === "choose_flights" && jsonData.status === "choosing_flight") dispatch({ type: 'setFlights', payload: jsonData.flights });
        if (jsonData.step === "create_activities" && jsonData.status === "completed_activity") dispatch({ type: 'setActivities', payload: jsonData.value });
        if (jsonData.step === "create_activities" && jsonData.status === 'waiting_quantity_days') dispatch({ type: 'setCity', payload: jsonData.value });
        if (jsonData.step === "create_activities" && jsonData.status === "waiting_value") dispatch({ type: 'setDays', payload: jsonData.value });
        if (jsonData.step === "find_country" && jsonData.status === "completed") dispatch({ type: 'setCountry', payload: jsonData.country });
        if (jsonData.step === "create_activities" && jsonData.status === "completed_activity") {
          jsonData.result = jsonData.value.replace(/\n/g, '');
          const parseValue = JSON.parse(jsonData.result);
          const parsed = JSON.parse(parseValue);
          dispatch({ type: 'setValue', payload: jsonData.price });
          dispatch({ type: 'setActivities', payload: parsed });
          return;
        }
        if (jsonData.status === "completed_date") dispatch({ type: 'setReturnDate', payload: jsonData.date });
        if (jsonData.status === "choosing_airport_departure" || jsonData.status === "completed_departure") {
          const editedDeparture = cityData(jsonData.departure);
          dispatch({ type: 'setDeparture', payload: jsonData.departure });
          if (jsonData.status === "choosing_airport_departure") createMessageOptionsAirports(editedDeparture);
          return;
        }
        if (jsonData.status === "completed_destination" || jsonData.status === "choosing_airport_destination") {
          const editedDestination = cityData(jsonData.destination);
          dispatch({ type: 'setDestination', payload: jsonData.destination });
          if (jsonData.status === "choosing_airport_destination") createMessageOptionsAirports(editedDestination);
          return;
        }
        
        if (jsonData.status === "creating_activities" || jsonData.status === "creating_meals") {
          jsonData.result = jsonData.result.replace(/\n/g, '');
          const parseValue = JSON.parse(jsonData.result);
          const parsed = JSON.parse(parseValue);
          if (jsonData.status === "creating_activities") {
            dispatch({ type: 'setActivities', payload: parsed });
            const data = {
              action: 'find_meals',
              city: parsed.travel_plan.destination,
              days: parsed.travel_plan.duration,
              value: parsed.travel_plan.budget,
            }
            stepsApplied.current.activities = true;
            socket.send(JSON.stringify(data));
          }
          if (jsonData.status === "creating_meals") {
            dispatch({ type: 'setMeals', payload: parsed });
            stepsApplied.current.meals = true;
          }
        }
        if (jsonData.status === "choosing_flight") {
          stepsApplied.current.flights = true;
        }
        if (stepsApplied.current.flights && stepsApplied.current.activities && stepsApplied.current.meals) {
          setInterval(() => {
            navigate("/result"); 
          }, 5000);
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
        AppState.setDeparture(action.payload);
        return { ...state, departure: action.payload };
      case 'setDestination':
        AppState.setDestination(action.payload);
        return { ...state, destination: action.payload };
      case 'setDate':
        AppState.setDate(action.payload);
        return { ...state, date: action.payload };
      case 'setReturnDate':
        AppState.setReturnDate(action.payload);
        return { ...state, returnDate: action.payload };
      case 'setName':
        AppState.setName(action.payload);
        return { ...state, name: action.payload };
      case 'setCity':
        AppState.setCity(action.payload);
        return { ...state, city: action.payload };
      case 'setDays':
        AppState.setDays(action.payload);
        return { ...state, days: action.payload };
      case 'setValue': 
        AppState.setValue(action.payload);
        return { ...state, value: action.payload };
      case 'setActivities':
        AppState.setActivities(action.payload);
        return { ...state, activities: action.payload };
      case 'setMeals':
        AppState.setMeals(action.payload);
        return { ...state, meals: action.payload };
      case 'setFlights':
        AppState.setFlights(action.payload);
        return { ...state, flights: action.payload };
      case 'setHasFlight':
        AppState.setHasFlight(action.payload);
        return { ...state, hasFlight: action.payload };
      case 'setCountry':
        AppState.setCountry(action.payload);
        return { ...state, country: action.payload };
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
    if (inputText === '') return;

    let data = {};
    const newMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);

    if (name === '') {
      handleNameInput(newMessage);
      return 
    }
    
    if (airport === '') {
      data = {
        action: 'ensure_have_airport',
        awnser: inputText,
      }
      setAirport(inputText);
    } else if (step === "flights" && status) {
      data = {
        action: 'find_cities',
        departure: null,
        awnser: inputText,
      }
    } else if (step === "flights" && !status) {
      data = {
        action: 'find_activities',
        awnser: inputText,
      }
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
      dispatch({ type: 'setDeparture', payload: filtered });
      data = {
        action: 'find_airport',
        departure: filtered,
        destination: null,
      }
    } else if (step === 'airports_defined' && status === 'completed_departure') {
      data = {
        action: 'find_cities',
        awnser: inputText,
        departure: departure,
      }
      setDeparture(inputText);
    } else if (step === 'airports_defined' && status === 'choosing_airport_destination') {
      const filtered = state.destination.filter(item => item.skyId === inputText.toUpperCase())
      if (filtered.length === 0) {
        setMessages([...messages, newMessage, {
          text: 'Por favor, escolha um aeroporto válido. (use as siglas indicadas)',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        }]);
        return;
      }
      data = {
        action: 'find_airport',
        departure: departure,
        destination: filtered,
      }
      socket.send(JSON.stringify(data));
    } else if (step === 'airports_defined' && status === 'completed_destination') {
      data = {
        action: 'format_date',
        awnser: inputText,
        field: 'date'
      }
    } else if (step === 'format_date' && status === 'waiting_return_date') {
      data = {
        action: 'format_date',
        awnser: inputText,
        field: 'return_date'
      }
      if (inputText.toLowerCase() === 'no' || inputText.toLowerCase() === 'não' || inputText.toLowerCase() === 'nao' || inputText.toLowerCase() === 'n') {
        data.awnser = null;
      }
      socket.send(JSON.stringify(data));  
    } else if (step === "format_date" && status === "completed_date") {
      data = {
        action: 'find_flights',
        departure: state.departure,
        destination: state.destination,
        date: state.date,
        returnDate: state.returnDate,
        awnser: inputText,
      }
    } else if (step === 'create_activities' && status) {
      data = {
        action: 'find_activities',
        city: AppState.city,
        days: state.days,
        awnser: inputText,
      }
    }
    socket.send(JSON.stringify(data));
    setInputText(''); 
  }

  const handleNameInput = (newMessage) => {
    setMessages([...messages, newMessage, {
      text: `Olá ${inputText}, você gostaria de incluir os voos de ida e volta no seu orçamento de viagem?`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString()
    }]);
    setName(inputText);
    dispatch({ type: 'setName', payload: inputText });
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
      messagesEndRef={messagesEndRef}
    />
  );
  
}

export default ChatLogic;