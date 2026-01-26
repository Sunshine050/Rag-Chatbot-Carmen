'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithAI } from '@/services/api';

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(input);
      setMessages((prev) => [...prev, { role: 'bot', content: response.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl border rounded-lg bg-white shadow-lg">
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-xl font-bold">BlueLedgers RAG Chatbot</h2>
        <p className="text-sm opacity-80">Documentation Hub Assistant</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-blue-100 ml-2' : 'bg-gray-100 mr-2'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span>กำลังประมวลผล...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="พิมพ์คำถามของคุณที่นี่..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
