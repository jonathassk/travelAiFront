import React, { useEffect, useReducer, useRef, useState } from 'react';
import ChatView from '../components/ChatView';
import AppState from '../services/mobxState.tsx';
import { useTypingEffect } from '../utils/typingeffect';
import { json, useNavigate } from "react-router-dom";
import { set, toJS } from 'mobx';


const URL = 'wss://o9ypfzpqv3.execute-api.sa-east-1.amazonaws.com/beta/';
const socket = new WebSocket(URL);
function ChatLogic() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [state, dispatch] = useReducer(reducer, { name: '', departure: [], destination: [], date: "", returnDate: "", flights: [], hasFlight: null, hotels: [], activities: [], meals: {}, cityOrigin: "", cityDestination: "", country: "", days: null, value: null, currency: '', messagesAI: [] });

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  let lastMessage = useRef(null);
  let stepsApplied = useRef({ flights: false, activities: false, meals: false })
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
        // text: 'Hello, I will be your travel assistant, helping you plan the best trip possible. First, please tell me your name.',
        text: 'Ola, serei seu assistente de viagem, irei estar te auxiliando a planejar a melhor viagem possivel, inicialmente, me diga seu nome por favor.',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    createMessages();
    socket.onopen = () => {
      console.log('connected on websocket server!');
    }

    socket.onmessage = async (event) => {
      let newMessage;
      try {
        const jsonData = JSON.parse(event.data);
        console.log(jsonData)
        let jsonExtracted;
        if (jsonData?.messages) jsonExtracted = await extractJson(jsonData?.messages[jsonData.messages.length - 1]?.content);
        if (!jsonExtracted && jsonData?.messages) {
          AppState.addMessage({ role: 'assistant', content: jsonData?.messages[jsonData.messages.length - 1]?.content });
          newMessage = {
            text: jsonData.messages[jsonData.messages.length - 1].content,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
        } else if (jsonExtracted?.airport_included) {
          newMessage = {
            text: "iremos buscar os aeroportos mais proximos de sua origem, aguarde um momento!",
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
          let data = {
            action: 'find_airport',
            cityOrigin: jsonExtracted?.origin?.name_city,
            cityDestination: jsonExtracted?.arrival?.name_city
          };
          socket.send(JSON.stringify(data));
        } else if (jsonExtracted?.airport_included == false) {
          newMessage = {
            text: "iremos preencher as refeições e atividades para seu planejamento, aguarde um momento!",
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
          let data = {
            action: 'find_activities',
            city: jsonExtracted.arrival?.name_city,
            days: differenceInDays(jsonExtracted?.date, jsonExtracted?.return_date),
            value: jsonExtracted.daily_budget,
            currency: jsonExtracted.currency
          };
          socket.send(JSON.stringify(data));
        }
        if (jsonData.cityData) {
          if (jsonData.cityData && state.departure.length === 0) {
            if (jsonData.cityData.length > 1) {
              createMessageOptionsAirports(jsonData.cityData);
            }
          }
        }

        if (jsonData.result?.travel_plan?.activities_travel) {
          dispatch({ type: 'setActivities', payload: jsonData.result });
          stepsApplied.current.activities = true;
          newMessage = {
            text: "atividades incluidas, agora iremos adicionar as refeições. Aguarde um momento!",
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
          let data = {
            action: 'find_meals',
            city: jsonData.result.travel_plan.destination,
            days: jsonData.result.travel_plan.duration,
            value: jsonData.result.travel_plan.budget,
            currency: jsonData.result.travel_plan.currency
          };
          socket.send(JSON.stringify(data));
        }
          
        if (jsonData.result?.meals_travel) {
          dispatch({ type: 'setMeals', payload: jsonData.result });
          stepsApplied.current.meals = true;
          newMessage = {
            text: "atividades incluidas, agora iremos adicionar as refeições. Aguarde um momento!",
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
        }
        console.log(stepsApplied.current)
        // if (stepsApplied.current.flights && stepsApplied.current.activities && stepsApplied.current.meals) {
        if (stepsApplied.current.activities && stepsApplied.current.meals) {
          setInterval(() => {
            navigate("/result");
          }, 5000);
        }
      } catch (error) {
        console.error("Erro ao fazer o parsing da string JSON:", error);
        return;
      }
    }


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
      case 'setCityOrigin':
        AppState.setCityOrigin(action.payload);
        return { ...state, cityOrigin: action.payload };
      case 'setCityDestination':
        AppState.setCityDestination(action.payload);
        return { ...state, cityDestination: action.payload };
      case 'setDays':
        AppState.setDays(action.payload);
        return { ...state, days: action.payload };
      case 'setValue':
        AppState.setValue(action.payload);
        return { ...state, value: action.payload };
      case 'setCurrency':
        AppState.setCurrency(action.payload);
        return { ...state, currency: action.payload };
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
      case 'setmessagesAI':
        return { ...state, messagesAI: action.payload };
      default:
        return state;
    }
  }

  const createMessage = () => {

  }

  const extractJson = (message) => {
    let startIndex = message.indexOf('{');
    let endIndex = message.lastIndexOf('}') + 1;
    let jsonData;
    if (startIndex !== -1 && endIndex !== -1) {
      let jsonString = message.substring(startIndex, endIndex);
      jsonData = JSON.parse(jsonString);
    }
    if (jsonData?.name) {
      dispatch({ type: 'setName', payload: jsonData?.name });
      dispatch({ type: 'setDate', payload: jsonData?.date });
      dispatch({ type: 'setReturnDate', payload: jsonData?.return_date });
      dispatch({ type: 'setDays', payload: differenceInDays(jsonData?.date, jsonData?.return_date) });
      dispatch({ type: 'setValue', payload: jsonData?.daily_budget });
      dispatch({ type: 'setCityOrigin', payload: jsonData?.origin?.name_city });
      dispatch({ type: 'setCityDestination', payload: jsonData?.arrival?.name_city });
      dispatch({ type: 'setCurrency', payload: jsonData?.currency });
      if (jsonData?.airport_included) {
        dispatch({ type: 'setHasFlight', payload: jsonData?.airport_included });
      }
    }
    return jsonData;
  }

  const differenceInDays = (date1, date2) => {
    const date1Obj = new Date(date1);
    const date2Obj = new Date(date2);
    const timeDiff = Math.abs(date2Obj.getTime() - date1Obj.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
  }

  const createMessageOptionsAirports = data => {
    try {
      const newMessage = {
        text: 'Escolha o aeroporto de origem, por favor utilize o codigo do aeroporto. Exemplo: LHR para Londres Heathrow, GRU para Guarulhos, NRT para toquio narita etc. ou escreva "Outro" caso o seu aeroporto nao esteja nessa lista',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);

      data.forEach(item => {
        const options = `${item.skyId} - ${item.presentation.suggestionTitle}`;
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
    const newMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    const messageIa = {
      "role": "user",
      "content": inputText
    }
    AppState.addMessage(messageIa);
    setMessages([...messages, newMessage]);
    dispatch({ type: 'setmessagesAI', payload: [...state.messagesAI, ...messages] });
    let data = {
      action: 'send_message',
      messages: toJS(AppState.messages)
    };
    socket.send(JSON.stringify(data));
    setInputText('');

    if (state.departure.length > 1) {
      const airport = state.departure.find(item => item.skyId === inputText);
      if (airport.length > 0) dispatch({ type: 'setDeparture', payload: airport });
      data = {
        action: 'find_airport',
        cityOrigin: state.cityOrigin,
        cityDestination: state.cityDestination,
        departure: AppState.departure
      };
      socket.send(JSON.stringify(data));
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  const createMessages = () => {
    const messages = [
      {
        "role": "user",
        "content": 'you are a travel planning assistant, your first task is to collect information from the user to complete a JSON object. You should maintaining a conversational flow, not ask all the informations at once. when all the necessary data is collected, send a JSON in the following format: {"name": String, "airport_included": boolean, "origin": {"name_city": String}, "arrival": {"name_city": String}, "date": String, "return_date": String, "daily_budget": Number, "currency": String}. Dates should be converted to the yyyy-mm-dd format, and the user should be free to input dates in any format, do not ask to him to put in a specific format. If the user does not want to include flights, do not need ask for the origin city, only destination. Try to keep the messages simple and small. send With the text, a json in this format {"field1": String, field2: String} and the field will be the name of field collected in this step.',
      }, {
        "role": "assistant",
        "content": "Ola, serei seu assistente de viagem, irei estar te auxiliando a planejar a melhor viagem possivel, inicialmente, me diga seu nome por favor"
        //   "content": "Hello, I'll be your travel assistant, helping you plan the best trip possible. First, please tell me your name."
      },
    ]
    dispatch({ type: 'setmessagesAI', payload: messages });
    messages.map((m) => {
      AppState.addMessage(m);
    });
  }

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