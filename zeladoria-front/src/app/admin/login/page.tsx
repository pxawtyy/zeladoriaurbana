"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Componente da página de Login Administrativo.
 * Renderiza o formulário de acesso restrito e gerencia o fluxo de autenticação 
 * utilizando o provedor de e-mail/senha do Supabase Auth.
 */
export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Intercepta a submissão do formulário, previne o recarregamento da tela e 
   * realiza a tentativa de autenticação na nuvem. Em caso de sucesso, 
   * redireciona de forma segura para a rota "/admin".
   * @param e Evento padrão de submissão do formulário React.
   */
  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setIsLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative">
      
      <a 
        href="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-[#004383] hover:text-[#003B73] flex items-center gap-2 font-medium transition-colors text-sm sm:text-base bg-white/80 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none px-3 py-1.5 sm:p-0 rounded-full sm:rounded-none shadow-sm sm:shadow-none z-10"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </a>

      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mt-12 sm:mt-0">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#004383] p-3 rounded-full text-white mb-4 shadow-md">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-sm text-slate-500 mt-1">Painel de Gestão da Zeladoria Urbana</p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#004383] focus:ring-2 focus:ring-[#004383]/20 rounded-lg px-4 py-2.5 outline-none transition text-slate-900"
              placeholder="admin@zeladoria.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#004383] focus:ring-2 focus:ring-[#004383]/20 rounded-lg px-4 py-2.5 outline-none transition text-slate-900"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#004383] hover:bg-[#003B73] text-white font-medium py-2.5 rounded-lg transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-[44px]"
          >
            {isLoading ? <span className="animate-pulse">Autenticando...</span> : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}