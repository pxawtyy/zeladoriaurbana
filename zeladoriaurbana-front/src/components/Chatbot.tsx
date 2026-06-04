"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: "bot", 
      text: "Olá! Sou o assistente de Zeladoria Urbana. Para registrar seu protocolo, por favor, digite seu nome e telefone." 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      text: inputValue,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        role: "bot",
        text: "Obrigado! Agora, descreva o problema que você encontrou na cidade de forma clara (ex: buraco na rua, poste apagado, lixo acumulado).",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Janela */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#004383] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <h3 className="font-semibold">Assistente Virtual</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white transform hover:scale-125 transition-transform duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensagens */}
          <div className="h-96 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                  msg.role === "bot" 
                    ? "bg-white border border-slate-200 text-slate-700 rounded-tl-none self-start" 
                    : "bg-[#004383] text-white rounded-tr-none self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..." 
              className="flex-grow bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004383]"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-[#004383] hover:bg-[#003B73] disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Botão Flutuante */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#004383] hover:bg-[#003B73] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center border-2 border-black"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}