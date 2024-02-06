import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChatView from '../components/ChatView';
import { useTypingEffect } from '../utils/typingeffect';
import createWebSocket from '../utils/socketConfig';

const URL = 'wss://tt8v0tezs8.execute-api.sa-east-1.amazonaws.com/production/';
const socket = new WebSocket(URL);
function ChatLogic() {
  const text = useTypingEffect("I'm your travel assistant", 20);
  const text2 = useTypingEffect("mr. flight", 20);

  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [airport, setAirport] = useState('');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
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
      console.log(event)
      console.log("step", event.data)
      if (event.data.trim() === '') return;
    
      let newMessage;
      try {
        const jsonData = JSON.parse(event.data);
        if (jsonData && jsonData.step) {
          if (jsonData.step == "flights") setAirport(jsonData.status);
          if (jsonData.step == "accommodation") setDeparture(jsonData.status);
          
        }
      
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
        if (jsonData.step == "airports_defined") {
          const editedDeparture = cityData(jsonData.departure);
          createMessageOptionsAirports(editedDeparture);
        }
      } catch (error) {
        console.error("Erro ao fazer o parsing da string JSON:", error);
        return;
      }
      
      if (newMessage.text !== '') setMessages(prevMessages => [...prevMessages, newMessage]);
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
      const options = data.map(item => {
        //if (item.entityType === 'CITY') 
        return `${item.skyId} - ${item.localizedName} - ${item.suggestionTitle} \n`;
      });
      console.log(options)
      const newMessage = {
        text: options,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]); // Update this line
      
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

    if (name === '') {
      setMessages([...messages, newMessage, {
        text: `Ola ${inputText}, Você gostaria de incluir os voos de ida e volta no seu orçamento de viagem?`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setName(inputText);
    } else if (airport === '') {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'ensure_have_airport',
        awnser: inputText,
      }
      setAirport(inputText);
      socket.send(JSON.stringify(data));
    } else if (airport == true && departure === '') {
      setMessages([...messages, newMessage]);
      const data = {
        action: 'find_cities',
        awnser: inputText,
      }
      socket.send(JSON.stringify(data));
      setInputText(''); 
    } else if (accommodation === '') {
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