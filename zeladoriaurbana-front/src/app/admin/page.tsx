"use client";

import { useEffect, useState } from "react";

type Chamado = {
  protocolo: number;
  nomeCidadao: string;
  telefone: string;
  endereco: string;
  descricao: string;
  imagemUrl: string | null;
  status: string;
  dataCriacao: string;
};

export default function AdminPanel() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const res = await fetch("http://localhost:5142/api/chamados");
        if (res.ok) {
          const data = await res.json();
          setChamados(data);
        }
      } catch (error) {
        console.error("Erro ao procurar chamados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChamados();
  }, []);

  const atualizarStatus = async (protocolo: number, novoStatus: string) => {
    setIsUpdating(protocolo);
    try {
      const res = await fetch(`http://localhost:5142/api/chamados/${protocolo}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
      });

      if (res.ok) {
        setChamados((prev) => 
          prev.map((c) => c.protocolo === protocolo ? { ...c, status: novoStatus } : c)
        );
        if (chamadoSelecionado?.protocolo === protocolo) {
          setChamadoSelecionado((prev) => prev ? { ...prev, status: novoStatus } : null);
        }
      } else {
        alert("Ocorreu um erro ao atualizar o status na base de dados.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de ligação com a API.");
    } finally {
      setIsUpdating(null);
    }
  };

  const formatarData = (dataIso: string) => {
    return new Date(dataIso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const calcularTempoAberto = (dataIso: string, status: string) => {
    if (status === "Resolvido") return "Concluído";
    const diffMs = new Date().getTime() - new Date(dataIso).getTime();
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    if (horas < 1) return "Há menos de 1 hora";
    if (horas < 24) return `Pendente há ${horas}h`;
    return `Pendente há ${Math.floor(horas / 24)} dias`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Em andamento": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolvido": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const totalPages = Math.ceil(chamados.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const chamadosVisiveis = chamados.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <header className="bg-[#004383] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xl font-bold tracking-tight">
              Zeladoria <span className="font-light text-blue-200">Painel de Gestão</span>
            </span>
          </div>
          <a href="/" className="text-sm font-medium text-blue-200 hover:text-white transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ocorrências Registradas</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie os chamados abertos pelos cidadãos.</p>
          </div>
          
          {/* Controle de Tabela */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span>Mostrar:</span>
              <select 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange}
                className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <button onClick={() => window.location.reload()} className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                  <th className="p-4 font-semibold whitespace-nowrap">Protocolo</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Cidadão</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Localização</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody key={`${currentPage}-${itemsPerPage}`} className="divide-y divide-slate-100 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando chamados...</td></tr>
                ) : chamadosVisiveis.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum chamado registrado.</td></tr>
                ) : (
                  chamadosVisiveis.map((chamado) => (
                    <tr key={chamado.protocolo} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-900">#{chamado.protocolo}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{chamado.nomeCidadao}</div>
                        <div className="text-xs text-slate-500">{formatarData(chamado.dataCriacao)}</div>
                      </td>
                      <td className="p-4 text-slate-700 max-w-[200px] truncate" title={chamado.endereco}>
                        {chamado.endereco}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(chamado.status)}`}>
                          {chamado.status}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <select
                          value={chamado.status}
                          onChange={(e) => atualizarStatus(chamado.protocolo, e.target.value)}
                          disabled={isUpdating === chamado.protocolo || chamado.status === "Resolvido"}
                          className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-[#004383] focus:border-[#004383] p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <option value="Aberto">Aberto</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Resolvido">Resolvido</option>
                        </select>
                        <button 
                          onClick={() => setChamadoSelecionado(chamado)}
                          className="text-[#004383] bg-blue-50 hover:bg-blue-100 p-2.5 rounded-lg transition ml-2 shadow-sm border border-blue-100"
                          title="Insights e Detalhes"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {!isLoading && chamados.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Mostrando <span className="font-medium text-slate-900">{startIndex + 1}</span> até <span className="font-medium text-slate-900">{Math.min(endIndex, chamados.length)}</span> de <span className="font-medium text-slate-900">{chamados.length}</span> resultados
              </span>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Anterior
                </button>
                <div className="flex items-center px-3 text-sm font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {chamadoSelecionado && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Protocolo #{chamadoSelecionado.protocolo}
                  <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(chamadoSelecionado.status)}`}>
                    {chamadoSelecionado.status}
                  </span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">Aberto em {formatarData(chamadoSelecionado.dataCriacao)}</p>
              </div>
              <button onClick={() => setChamadoSelecionado(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-5">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                  <div className="text-yellow-600 mt-0.5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Insight da Ocorrência</h4>
                    <p className="text-sm text-yellow-900 mt-1 font-medium">{calcularTempoAberto(chamadoSelecionado.dataCriacao, chamadoSelecionado.status)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cidadão</h4>
                  <p className="text-sm text-slate-800 font-medium">{chamadoSelecionado.nomeCidadao}</p>
                  <p className="text-sm text-slate-500">{chamadoSelecionado.telefone}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Localização</h4>
                  <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {chamadoSelecionado.endereco}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição Completa</h4>
                  <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {chamadoSelecionado.descricao}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Evidência Fotográfica</h4>
                {chamadoSelecionado.imagemUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-full min-h-[250px] flex items-center justify-center relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={chamadoSelecionado.imagemUrl} 
                      alt="Anexo do cidadão" 
                      className="max-w-full max-h-[300px] object-contain transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <p className="hidden text-sm text-slate-400 p-4 text-center">Erro ao carregar a imagem da URL fornecida.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 h-[250px] flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm">Nenhum anexo enviado.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}