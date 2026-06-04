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
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ nome: "", telefone: "", descricao: "" });
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: "bot", 
      text: "Olá! Sou o assistente de Zeladoria Urbana. Para começar a registrar seu protocolo, por favor, digite o seu nome completo." 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: userText }]);
    setIsTyping(true);

    setTimeout(async () => {
      if (step === 0) {
        setFormData((prev) => ({ ...prev, nome: userText }));
        setMessages((prev) => [...prev,
        {
          id: Date.now(),
          role: "bot",
          text: `Prazer, ${userText}! Agora, digite o seu telemóvel (com DDD).`
        }
        ]);
        setStep(1);
        setIsTyping(false);
      } 
      else if (step === 1) {
        let numeroLimpo = userText.replace(/\D/g, '');
        
        if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
          setMessages((prev) => [...prev,
            {
              id: Date.now(),
              role: "bot",
              text: "Hmm, esse número parece inválido. Por favor, digite apenas números com o DDD (ex: 11988887777)." 
            }
          ]);
          setIsTyping(false);
          return; 
        }

        if (!numeroLimpo.startsWith('55')) {
          numeroLimpo = `55${numeroLimpo}`;
        }

        setFormData((prev) => ({ ...prev, telefone: numeroLimpo }));
        setMessages((prev) => [...prev, {
          id: Date.now(),
          role: "bot",
          text: "Perfeito! Agora, descreva detalhadamente o problema que encontrou na via (ex: buraco, poste apagado, lixo)."
        }]);
        setStep(2);
        setIsTyping(false);
      } 
      else if (step === 2) {
        setFormData((prev) => ({ ...prev, descricao: userText }));
        setMessages((prev) => [...prev, {
          id: Date.now(),
          role: "bot",
          text: "Deseja enviar uma foto do problema? Cole o link (URL) da imagem aqui, ou digite 'pular' para enviar sem foto."
        }]);
        setStep(3);
        setIsTyping(false);
      }
      else if (step === 3) {
        const pular = userText.toLowerCase().trim() === 'pular';
        const imagemUrlFinal = pular ? null : userText;

        setMessages((prev) => [...prev, {
          id: Date.now(),
          role: "bot",
          text: "A gerar o seu protocolo, um momento..."
        }]);
        setStep(4);
        try {
          const res = await fetch("http://localhost:5142/api/chamados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: formData.nome,
              telefone: formData.telefone,
              descricao: formData.descricao,
              imagemUrl: imagemUrlFinal
            })
          });

          const data = await res.json();

          if (res.ok) {
            setMessages((prev) => [...prev, { 
              id: Date.now(), 
              role: "bot", 
              text: `✅ Chamado registrado com sucesso! O seu número de protocolo é: *${data.protocolo}*. Avisaremos via WhatsApp sobre as atualizações de status.` 
            }]);
          } else {
            throw new Error("Erro na API");
          }
        } catch (error) {
          setMessages((prev) => [...prev, { 
            id: Date.now(), 
            role: "bot", 
            text: "❌ Ops, ocorreu um erro ao registrar o seu chamado. Tente novamente mais tarde." 
          }]);
        } finally {
          setIsTyping(false);
          setStep(5);
        }
      }
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right">
          
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
            {isTyping && (
               <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-none self-start shadow-sm text-xs flex gap-1">
                 <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step === 5 ? "Atendimento encerrado." : "Digite a sua mensagem..."} 
              disabled={isTyping || step === 5}
              className="flex-grow bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004383] disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping || step === 5}
              className="bg-[#004383] hover:bg-[#003B73] disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

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