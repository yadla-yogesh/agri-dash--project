import React, { useState, useEffect, useRef } from 'react';
import { Loader2, SendHorizontal } from 'lucide-react';

// FIX: Added a default value for the 't' prop to prevent crashes.
export default function AgriBot({ t = (key) => key, language }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // FIX: Changed the dependency from [t] to [language] to prevent an infinite loop.
  // This effect now runs only when the language changes.
  useEffect(() => {
    setMessages([{ text: t('initialBotMessage'), sender: 'bot' }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/ask-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, language: language }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const botResponse = { text: data.answer, sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Failed to get response from bot:", error);
      const errorResponse = { text: t('botError'), sender: 'bot' };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-2">{t('agriBotTitle')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('agriBotSubtitle')}</p>
      
      <div className="flex-1 bg-white dark:bg-gray-900/50 p-4 rounded-2xl shadow-lg overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">
              <Loader2 size={20} className="animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-6">
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('agriBotPlaceholder')} className="w-full py-3 pl-4 pr-12 bg-white dark:bg-gray-900 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors">
            <SendHorizontal size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
