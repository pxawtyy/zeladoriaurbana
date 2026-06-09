import Image from "next/image";
import { useState } from "react";
import { Chamado } from "@/types";
import { formatarData, getStatusColor } from "@/utils/formatters";

/**
 * Interface de propriedades para o modal de detalhes do chamado.
 */
interface ChamadoModalProps {
    /** Objeto completo do chamado selecionado. */
    chamado: Chamado;
    /** Callback para fechar o modal. */
    onClose: () => void;
}

/**
 * Modal flutuante que exibe os detalhes completos, análises da IA, histórico do chat 
 * e fotos de um chamado específico.
 */
export default function ChamadoModal({ chamado, onClose }: ChamadoModalProps) {
    const [imagemExpandida, setImagemExpandida] = useState<string | null>(null);

    return (
        <>
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start z-10">
                <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Protocolo #{chamado.protocolo}
                    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(chamado.status)}`}>
                    {chamado.status}
                    </span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">Aberto em {formatarData(chamado.dataCriacao)}</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 uppercase tracking-wider">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Triagem por IA
                    </div>
                    
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resumo da Ocorrência</h4>
                    <p className="text-slate-800 font-medium text-sm mb-4 leading-relaxed">
                    {chamado.resumoIa || "Resumo não gerado pelo assistente."}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                    {chamado.urgencia && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        chamado.urgencia.toLowerCase() === 'alta' ? 'bg-red-50 text-red-700 border-red-200' :
                        chamado.urgencia.toLowerCase() === 'media' || chamado.urgencia.toLowerCase() === 'média' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        Urgência: {chamado.urgencia}
                        </span>
                    )}

                    {chamado.categoria && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#004383] border border-blue-200">
                        {chamado.categoria}
                        </span>
                    )}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Cidadão</h4>
                    <p className="text-sm text-slate-800 font-medium">{chamado.nomeCidadao}</p>
                    <p className="text-sm text-slate-500">{chamado.telefone}</p>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Localização</h4>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-start gap-3">
                    <p className="text-sm text-slate-800 leading-relaxed">{chamado.endereco}</p>
                    
                    {chamado.endereco && chamado.endereco.toLowerCase() !== "não sei" && chamado.endereco.toLowerCase() !== "nao sei" && (
                        <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chamado.endereco + ", Diadema - SP")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004383] hover:text-[#003B73] bg-blue-100/50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors border border-blue-200"
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Ver no Google Maps
                        </a>
                    )}
                    </div>
                </div>
                
                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Descrição Completa</h4>
                    <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {chamado.descricao}
                    </p>
                </div>
                </div>

                {chamado.historicoChat && (
                <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Histórico de Interação</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 h-64 overflow-y-auto flex flex-col gap-2 shadow-inner">
                    {JSON.parse(chamado.historicoChat).map((msg: any) => (
                        <div key={msg.id} className={`p-2.5 rounded-xl text-[13px] max-w-[90%] ${msg.role === "bot" ? "bg-white border border-slate-200 text-slate-600 rounded-tl-none self-start" : "bg-slate-200 text-slate-800 rounded-tr-none self-end"}`}>
                        {msg.text.includes("📷 Imagem enviada:") ? (
                            <div className="flex flex-col gap-1">
                            <span className="font-medium text-slate-700">📷 Imagem enviada</span>
                            <a href={msg.text.split("📷 Imagem enviada: ")[1]} target="_blank" rel="noopener noreferrer" className="text-[#004383] underline hover:text-blue-500 truncate inline-block max-w-full">
                                Ver anexo original
                            </a>
                            </div>
                        ) : (
                            msg.text
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                )}

                <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Evidência Fotográfica</h4>
                {chamado.imagemUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-full min-h-[250px] flex items-center justify-center relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image 
                        src={chamado.imagemUrl} 
                        alt="Anexo do cidadão" 
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain transition duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={() => setImagemExpandida(chamado.imagemUrl!)}
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

        {imagemExpandida && (
            <div 
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
            onClick={() => setImagemExpandida(null)}
            >
            <button onClick={() => setImagemExpandida(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black p-3 rounded-full transition-all z-10 hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image
                src={imagemExpandida} 
                alt="Anexo em tela cheia" 
                fill 
                sizes="(max-width: 768px) 90vw, 80vw"
                className="object-contain cursor-default rounded-lg shadow-2xl animate-in zoom-in-95 duration" 
                onClick={(e) => e.stopPropagation()} 
            />
            </div>
        )}
        </>
    );
}