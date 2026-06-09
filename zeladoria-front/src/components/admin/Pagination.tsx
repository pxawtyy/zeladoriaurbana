/**
 * Interface de propriedades para o controle de paginação.
 */
interface PaginationProps {
    /** Página atual selecionada. */
    currentPage: number;
    /** Total geral de páginas disponíveis. */
    totalPages: number;
    /** Índice do primeiro item sendo exibido (para contagem). */
    startIndex: number;
    /** Índice do último item sendo exibido (para contagem). */
    endIndex: number;
    /** Quantidade total absoluta de itens na lista. */
    totalItems: number;
    /** Função callback disparada quando o usuário clica em "Anterior" ou "Próxima". */
    onPageChange: (page: number) => void;
}

/**
 * Componente de paginação para navegar entre blocos de resultados.
 */
export default function Pagination({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    onPageChange
}: PaginationProps) {
    return (
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-500 text-center sm:text-left">
            A mostrar <span className="font-medium text-slate-900">{startIndex + 1}</span> até <span className="font-medium text-slate-900">{Math.min(endIndex, totalItems)}</span> de <span className="font-medium text-slate-900">{totalItems}</span> resultados
            </span>
            
            <div className="flex gap-1 w-full sm:w-auto justify-center">
            <button 
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-300 disabled:cursor-not-allowed transition cursor-pointer"
            >
                Anterior
            </button>
            <div className="flex items-center px-3 text-sm font-medium text-slate-700">
                {currentPage} / {totalPages}
            </div>
            <button 
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-300 disabled:cursor-not-allowed transition cursor-pointer"
            >
                Próxima
            </button>
            </div>
        </div>
    );
}