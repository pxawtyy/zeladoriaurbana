export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-[#004383]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-[#004383]">
              Zeladoria <span className="font-light text-slate-500">Urbana</span>
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-[#004383] transition">Como Funciona</a>
            <a href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#004383] transition">Painel Administrativo</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center flex flex-col items-center justify-center">
          <span className="text-xs font-semibold tracking-wider text-[#2A5BB1] uppercase bg-blue-50 px-3 py-1 rounded-full mb-4">
            Canal Direto com o Cidadão
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl leading-tight">
            Colabore com a manutenção e zeladoria da nossa cidade.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed">
            Encontrou problemas como buracos na via, iluminação pública apagada ou descarte irregular de lixo? Relate instantaneamente através do nosso assistente virtual.
          </p>
          <div className="mt-10">
            <button className="bg-[#004383] hover:bg-[#003B73] text-white font-medium px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Iniciar Relato via Chatbot
            </button>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="bg-white py-24 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">O caminho até a solução do problema</h2>
              <p className="text-slate-500 mt-2">Um fluxo transparente focado em resolver as demandas com agilidade.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Card 1 */}
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-start">
                <div className="p-3 bg-blue-50 text-[#004383] rounded-lg mb-5">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">1. Descreva o Problema</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Relate o ocorrido detalhadamente pelo chat. Se puder, você também poderá enviar uma imagem para ajudar na triagem.</p>
              </div>

              {/* Card 2 */}
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-start">
                <div className="p-3 bg-blue-50 text-[#004383] rounded-lg mb-5">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">2. Geração de Protocolo</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Nosso chatbot inteligente processará os dados fornecidos e criará seu protocolo de atendimento.</p>
              </div>

              {/* Card 3 */}
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-start">
                <div className="p-3 bg-blue-50 text-[#004383] rounded-lg mb-5">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">3. Notificação em Tempo Real</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Toda alteração feita na triagem ou na resolução do problema avisará você via WhatsApp de forma automática.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#004383] text-blue-100 py-8 text-center text-sm border-t border-[#003B73]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="opacity-80 font-medium">Prefeitura Municipal — Sistema de Gestão de Zeladoria</p>
          <div className="h-px bg-blue-800 w-16 my-1"></div>
          <p className="opacity-60 text-xs">&copy; {new Date().getFullYear()} Zeladoria Urbana. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}