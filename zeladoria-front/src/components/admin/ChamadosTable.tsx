import { Chamado } from "@/types";

export default function ChamadosTable({
    chamados,
    isLoading,
    isUpdating,
    onAtualizarStatus,
    onSelecionarChamado
}: {
    chamados: Chamado[];
    isLoading: boolean;
    isUpdating: number | null;
    onAtualizarStatus: (protocolo: number, status: string) => void;
    onSelecionarChamado: (chamado: Chamado) => void;
}) {
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
        <>
        <table className="w-full text-left border-collapse hidden lg:table">
            <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-4 font-semibold whitespace-nowrap">Protocolo</th>
                <th className="p-4 font-semibold whitespace-nowrap">Cidadão</th>
                <th className="p-4 font-semibold whitespace-nowrap">Localização</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            {isLoading ? (
                [...Array(5)].map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse border-b border-slate-100">
                    <td className="p-4"><div className="h-5 bg-slate-200 rounded-md w-16"></div></td>
                    <td className="p-4 flex flex-col gap-2">
                    <div className="h-5 bg-slate-200 rounded-md w-32"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-24"></div>
                    </td>
                    <td className="p-4"><div className="h-5 bg-slate-200 rounded-md w-48"></div></td>
                    <td className="p-4"><div className="h-7 bg-slate-200 rounded-full w-24"></div></td>
                    <td className="p-4 flex items-center justify-center gap-2">
                    <div className="h-9 bg-slate-200 rounded-lg w-28"></div>
                    <div className="h-9 w-9 bg-slate-200 rounded-lg"></div>
                    </td>
                </tr>
                ))
            ) : chamados.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum chamado registrado.</td></tr>
            ) : (
                chamados.map((chamado) => (
                <tr key={chamado.protocolo} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-900">#{chamado.protocolo}</td>
                    <td className="p-4">
                    <div className="font-medium text-slate-900">{chamado.nomeCidadao}</div>
                    <div className="text-xs text-slate-500">{formatarData(chamado.dataCriacao)}</div>
                    </td>
                    <td className="p-4 text-slate-700 max-w-[200px] truncate" title={chamado.endereco}>{chamado.endereco}</td>
                    <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(chamado.status)}`}>
                        {chamado.status}
                    </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                    <select
                        value={chamado.status}
                        onChange={(e) => onAtualizarStatus(chamado.protocolo, e.target.value)}
                        disabled={isUpdating === chamado.protocolo || chamado.status === "Resolvido"}
                        className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg focus:ring-[#004383] focus:border-[#004383] p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <option value="Aberto">Aberto</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Resolvido">Resolvido</option>
                    </select>
                    <button 
                        onClick={() => onSelecionarChamado(chamado)}
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

        {/* Mobile View */}
        <div className="block lg:hidden divide-y divide-slate-100">
            {isLoading ? (
            [...Array(4)].map((_, index) => (
                <div key={`mob-skel-${index}`} className="p-5 space-y-3 animate-pulse">
                <div className="flex justify-between">
                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-5 bg-slate-200 rounded-full w-1/4"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-2/4 mt-2"></div>
                <div className="h-10 bg-slate-100 rounded w-full mt-3"></div>
                </div>
            ))
            ) : chamados.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum chamado registrado.</div>
            ) : (
            chamados.map((chamado) => (
                <div key={chamado.protocolo} className="p-5 flex flex-col gap-3 hover:bg-slate-50 transition animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-start">
                    <div>
                    <span className="font-bold text-slate-900 text-base">#{chamado.protocolo}</span>
                    <div className="text-sm font-medium text-slate-900 mt-1">{chamado.nomeCidadao}</div>
                    <div className="text-xs text-slate-500">{formatarData(chamado.dataCriacao)}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wider ${getStatusColor(chamado.status)}`}>
                    {chamado.status}
                    </span>
                </div>
                
                <div className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase block mb-1 tracking-wider">Localização</span>
                    {chamado.endereco}
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <select
                    value={chamado.status}
                    onChange={(e) => onAtualizarStatus(chamado.protocolo, e.target.value)}
                    disabled={isUpdating === chamado.protocolo || chamado.status === "Resolvido"}
                    className="flex-grow bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-[#004383] focus:border-[#004383] p-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                    <option value="Aberto">Aberto</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Resolvido">Resolvido</option>
                    </select>
                    <button 
                    onClick={() => onSelecionarChamado(chamado)}
                    className="text-[#004383] bg-blue-50 hover:bg-blue-100 p-2.5 rounded-lg transition shadow-sm border border-blue-100 shrink-0 flex items-center justify-center"
                    >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    </button>
                </div>
                </div>
            ))
            )}
        </div>
        </>
    );
}