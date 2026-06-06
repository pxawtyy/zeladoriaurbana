"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "", descricao: "" });
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: "bot", 
      text: "Olá! Sou o assistente de Zeladoria Urbana. Para começar a registrar o seu protocolo, por favor, digite o seu nome completo." 
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, []);

  useEffect(() => {
    if (isOpen && !isTyping && step !== 4 && step !== 6) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isTyping, step, isOpen]);

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
        setMessages((prev) => [...prev, {
          id: Date.now(),
          role: "bot",
          text: `Prazer, ${userText}! Agora, digite o seu celular (com DDD).`
        }]);
        setStep(1);
        setIsTyping(false);
      } 
      else if (step === 1) {
        let numeroLimpo = userText.replace(/\D/g, '');
        
        if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
          setMessages((prev) => [...prev, {
            id: Date.now(),
            role: "bot",
            text: "Hmm, esse número parece inválido. Por favor, digite apenas números com o DDD (ex: 11988887777)." 
          }]);
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
          text: "Ótimo! Qual é o endereço completo ou ponto de referência do problema? (Se não souber, digite 'Não sei')."
        }]);
        setStep(2);
        setIsTyping(false);
      } 
      else if (step === 2) {
        setFormData((prev) => ({ ...prev, endereco: userText }));
        setMessages((prev) => [...prev, {
          id: Date.now(),
          role: "bot",
          text: "Entendido. Descreva detalhadamente o problema que encontrou na via (ex: buraco, poste apagado, lixo)."
        }]);
        setStep(3);
        setIsTyping(false);
      }
      else if (step === 3) {
        setFormData((prev) => ({ ...prev, descricao: userText }));
        setMessages((prev) => [...prev, {
          id: Date.now(),
          role: "bot",
          text: "Para finalizar, envie uma foto do problema anexando o arquivo abaixo, ou clique em 'Pular' se não tiver foto."
        }]);
        setStep(4);
        setIsTyping(false);
      }
    }, 800);
  };

  const handleFileUpload = async (file: File | null) => {
    setIsTyping(true);
    setStep(5);

    if (file) {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "user",
        text: "📷 Arquivo de imagem enviado."
      }]);
    } else {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "user",
        text: "Pular imagem."
      }]);
    }

    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: "bot",
      text: "Gerando o seu protocolo, um momento..."
    }]);

    try {
      let imagemUrlFinal = null;

      // Upload pro Supabase
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ocorrencias')
          .upload(fileName, file);

        if (uploadError) throw new Error("Erro ao fazer upload da imagem");

        const { data: publicUrlData } = supabase.storage
          .from('ocorrencias')
          .getPublicUrl(fileName);

        imagemUrlFinal = publicUrlData.publicUrl;
      }

      const mensagemAnexo = file 
        ? { id: Date.now(), role: "user", text: `📷 Imagem enviada: ${imagemUrlFinal}` }
        : { id: Date.now(), role: "user", text: "Nenhuma imagem anexada." };
        
      const historicoFinal = [...messages, mensagemAnexo];

      const res = await fetch("http://localhost:5142/api/chamados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          endereco: formData.endereco,
          descricao: formData.descricao,
          imagemUrl: imagemUrlFinal,
          historicoChat: JSON.stringify(historicoFinal)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { 
          id: Date.now(), 
          role: "bot", 
          text: `✅ Chamado registrado com sucesso! Seu protocolo é: *${data.protocolo}*. Avisaremos via WhatsApp sobre as atualizações.` 
        }]);
      } else {
        throw new Error("Erro na API");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { 
        id: Date.now(), 
        role: "bot", 
        text: "❌ Ops, ocorreu um erro ao registrar o seu chamado. Tente novamente mais tarde." 
      }]);
    } finally {
      setIsTyping(false);
      setStep(6);
      setSelectedFile(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div 
        className={`absolute bottom-full right-0 mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col origin-bottom-right transition-all duration-300 ease-out ${
          isOpen 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-50 translate-y-10 pointer-events-none"
        }`}
      >
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
            className="text-blue-200 hover:text-white transform hover:scale-125 transition-transform duration-200 cursor-pointer"
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

        <div className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
          {step === 4 ? (
            <div className="flex gap-2 items-center w-full animate-in fade-in zoom-in duration-300">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#004383] hover:file:bg-blue-100 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleFileUpload(null)}
                disabled={isTyping}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition px-2 cursor-pointer disabled:opacity-50"
              >
                Pular
              </button>
              <button 
                type="button"
                onClick={() => handleFileUpload(selectedFile)}
                disabled={!selectedFile || isTyping}
                className="bg-[#004383] hover:bg-[#003B73] disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition flex items-center justify-center shrink-0 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
              <input 
                ref={inputRef}
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step === 6 ? "Atendimento encerrado." : "Digite a sua mensagem..."} 
                disabled={isTyping || step === 6}
                className="flex-grow bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004383] disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isTyping || step === 6}
                className="bg-[#004383] hover:bg-[#003B73] disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2 rounded-full transition flex items-center justify-center cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(true)}
        className={`bg-[#004383] hover:bg-[#003B73] text-white p-4 rounded-full shadow-xl hover:shadow-2xl border-2 border-black flex items-center justify-center cursor-pointer transition-all duration-300 ease-out absolute bottom-0 right-0 ${
          isOpen 
            ? "scale-50 opacity-0 pointer-events-none translate-y-4" 
            : "scale-100 opacity-100 translate-y-0 hover:-translate-y-1"
        }`}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

    </div>
  );
}