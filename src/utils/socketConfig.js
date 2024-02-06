const createWebSocket = (setMessages, setIsConnected) => {
    const socket = new WebSocket('sua-url-do-websocket');
  
    socket.onopen = () => {
      console.log('Conectado no servidor WebSocket!');
    };
  
    socket.onmessage = (event) => {
      if (event.data.trim() === '') return;
  
      let newMessage;
      try {
        const jsonData = JSON.parse(event.data);
  
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
      } catch (error) {
        console.error("Erro ao fazer o parsing da string JSON:", error);
        return;
      }
  
      if (newMessage.text !== '') setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
  
    socket.onclose = () => {
      setIsConnected(false);
    };
  
    socket.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };
  
    return socket;
  };
  
  export default createWebSocket;