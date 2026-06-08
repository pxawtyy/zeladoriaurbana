"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Chamado } from "@/types";
import { api } from "@/services/api";

import ChamadosTable from "@/components/admin/ChamadosTable";
import Pagination from "@/components/admin/Pagination";
import ChamadoModal from "@/components/admin/ChamadoModal";

export default function AdminPanel() {
  const router = useRouter();
  const [adminNome, setAdminNome] = useState("");
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin/login");
      } else {
        setAdminNome(session.user.email?.split('@')[0] || "Admin"); 
        setIsAuthChecking(false);
        fetchChamados();
      }
    };

    checkUser();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chamados' },
        (payload) => {
          console.log('Mudança em tempo real recebida!', payload);
          fetchChamados(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const fetchChamados = async () => {
    try {
      const data = await api.listarChamados();
      setChamados(data);
    } catch (error) {
      console.error("Erro ao procurar chamados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (isAuthChecking) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Carregando...</div>;

  const atualizarStatus = async (protocolo: number, novoStatus: string) => {
    setIsUpdating(protocolo);
    try {
      await api.atualizarStatus(protocolo, novoStatus);
      
      setChamados((prev) => 
        prev.map((c) => c.protocolo === protocolo ? { ...c, status: novoStatus } : c)
      );
      if (chamadoSelecionado?.protocolo === protocolo) {
        setChamadoSelecionado((prev) => prev ? { ...prev, status: novoStatus } : null);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Ocorreu um erro de ligação com a API ao atualizar o status.");
    } finally {
      setIsUpdating(null);
    }
  };

  const totalPages = Math.ceil(chamados.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const chamadosVisiveis = chamados.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <header className="bg-[#004383] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-base sm:text-xl font-bold tracking-tight whitespace-nowrap">
              Zeladoria <span className="font-light text-blue-200">Painel de Gestão</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-4">
            <a href="/" className="text-sm font-medium text-blue-200 hover:text-white transition flex items-center gap-1">
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Voltar ao site</span>
            </a>
            <div className="h-4 w-px bg-blue-400/50 hidden sm:block"></div>
            <span className="text-sm font-medium text-blue-200 hidden sm:block">Olá, {adminNome}</span>
            <div className="h-4 w-px bg-blue-400/50 hidden sm:block"></div>
            <button onClick={handleLogout} className="text-sm font-medium text-blue-200 hover:text-white transition flex items-center gap-1 cursor-pointer">
              <span className="hidden sm:inline">Sair</span>
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ocorrências Registradas</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie os chamados abertos pelos cidadãos.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span>Mostrar:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
            </div>
            
            <button onClick={() => fetchChamados()} className="text-sm bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Atualizar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <ChamadosTable 
            chamados={chamadosVisiveis} 
            isLoading={isLoading} 
            isUpdating={isUpdating} 
            onAtualizarStatus={atualizarStatus} 
            onSelecionarChamado={setChamadoSelecionado} 
          />
          
          {!isLoading && chamados.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={chamados.length}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>

      {chamadoSelecionado && (
        <ChamadoModal 
          chamado={chamadoSelecionado} 
          onClose={() => setChamadoSelecionado(null)} 
        />
      )}

      {isUpdating !== null && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="text-white font-medium text-lg drop-shadow-md">Atualizando status...</span>
        </div>
      )}
    </div>
  );
}