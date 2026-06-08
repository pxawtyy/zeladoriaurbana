export type Chamado = {
    protocolo: number;
    nomeCidadao: string;
    telefone: string;
    endereco: string;
    descricao: string;
    imagemUrl: string | null;
    status: string;
    dataCriacao: string;
    historicoChat: string | null;
    categoria?: string;
    urgencia?: string;
    resumoIa?: string;
};

export type Message = {
    id: number;
    role: "bot" | "user";
    text: string;
};