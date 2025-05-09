import React, { useState, useEffect, useContext } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface DashboardContextType {
  selectedSupplier?: string;
  selectedDepartment?: string;
  currentMetrics?: {
    totalSpend?: number;
    pendingRequisitions?: number;
    openPurchaseOrders?: number;
    inventoryValue?: number;
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  isOpen: boolean;
  toggleChat: () => void;
}

const DashboardContext = React.createContext<DashboardContextType>({});

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [eventSource, setEventSource] = useState<EventSourcePolyfill | null>(null);
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    const es = new EventSourcePolyfill('/api/chat/stream', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const content = String(data.content || ''); // Convert to string or use empty string if undefined
        
        if (!content) {
          console.error('Received empty content from server');
          return;
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          content: content,
          timestamp: new Date(),
        }]);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    const handleError = (err: Event) => {
      console.error('SSE error:', err);
      // Attempt to reconnect or handle error appropriately
      (es as EventSource).close(); // Close the current connection on error
      // You might want to implement a reconnection strategy here
    };

    (es as EventSource).onmessage = handleMessage;
    (es as EventSource).onerror = handleError;

    setEventSource(es);

    return () => {
      if (es) {
        (es as EventSource).onmessage = null;
        (es as EventSource).onerror = null;
        (es as EventSource).close();
      }
    };
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          message: content,
          context: {
            selectedSupplier: dashboardContext?.selectedSupplier,
            selectedDepartment: dashboardContext?.selectedDepartment,
            currentMetrics: dashboardContext?.currentMetrics
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date()
      }]);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isOpen, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
};

const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isOpen, toggleChat } = useChat();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
    setInputValue('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">TimeWise Procurement Assistant</h3>
        <button onClick={toggleChat} className="text-white hover:text-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto max-h-96">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>How can I help you with your procurement operations today?</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                >
                  <p>{message.content}</p>
  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
