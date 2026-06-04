"use client";

import { useEffect, useState } from "react";

type Chamado = {
  protocolo: number;
  nomeCidadao: string;
  telefone: string;
  descricao: string;
  imagemUrl: string | null;
  status: string;
  dataCriacao: string;
};

export default function AdminPanel() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const res = await fetch("http://localhost:5142/api/chamados");
        if (res.ok) {
          const data = await res.json();
          setChamados(data);
        }
      } catch (error) {
        console.error("Erro ao buscar chamados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChamados();
  }, []);

  const formatarData = (dataIso: string) => {
    return new Date(dataIso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Em andamento": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolvido": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-[#004383] text-white shadow-md sticky top-0 z-50">
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
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ocorrências Registradas</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie os chamados abertos pelos cidadãos.</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>

        {/* Tabela de Dados */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                  <th className="p-4 font-semibold">Protocolo</th>
                  <th className="p-4 font-semibold">Cidadão</th>
                  <th className="p-4 font-semibold">Descrição do Problema</th>
                  <th className="p-4 font-semibold">Data e Hora</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Carregando chamados...
                    </td>
                  </tr>
                ) : chamados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhum chamado registrado ainda.
                    </td>
                  </tr>
                ) : (
                  chamados.map((chamado) => (
                    <tr key={chamado.protocolo} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-900">#{chamado.protocolo}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{chamado.nomeCidadao}</div>
                        <div className="text-xs text-slate-500">{chamado.telefone}</div>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs truncate" title={chamado.descricao}>
                        {chamado.descricao}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatarData(chamado.dataCriacao)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(chamado.status)}`}>
                          {chamado.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-[#004383] hover:text-[#003B73] font-medium text-sm underline underline-offset-2">
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}