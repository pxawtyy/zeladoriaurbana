/**
 * Formata uma data ISO para o padrão brasileiro (DD/MM/AAAA HH:MM).
 */
export const formatarData = (dataIso: string) => {
    return new Date(dataIso).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
};

/**
 * Retorna as classes utilitárias do Tailwind referentes à cor da etiqueta com base no status.
 */
export const getStatusColor = (status: string) => {
    switch (status) {
        case "Aberto": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Em andamento": return "bg-blue-100 text-blue-800 border-blue-200";
        case "Resolvido": return "bg-green-100 text-green-800 border-green-200";
        default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
};