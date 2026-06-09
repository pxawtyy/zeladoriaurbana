/**
 * Representa a entidade principal do sistema: o relato de um problema urbano
 * feito por um cidadão, enriquecido com a triagem da Inteligência Artificial.
 */
export type Chamado = {
    /** Identificador numérico do chamado. */
    protocolo: number;
    /** Nome completo do cidadão que abriu a ocorrência. */
    nomeCidadao: string;
    /** Número de telefone (com DDD) utilizado como chave de identificação do usuário. */
    telefone: string;
    /** Endereço ou ponto de referência fornecido no relato. */
    endereco: string;
    /** Descrição detalhada do problema (buraco, lixo, poste apagado, etc.). */
    descricao: string;
    /** URL pública da foto enviada para o Supabase Storage. */
    imagemUrl: string | null;
    /** Situação atual do atendimento (Aberto, Em andamento, Resolvido). */
    status: string;
    /** Data e hora de criação do protocolo. */
    dataCriacao: string;
    /** String JSON contendo a matriz de mensagens trocadas com o bot. */
    historicoChat: string | null;
    /** (Gerado por IA) Categoria deduzida do problema. */
    categoria?: string;
    /** (Gerado por IA) Nível de urgência da ocorrência (Alta, Media, Baixa). */
    urgencia?: string;
    /** (Gerado por IA) Uma frase curta resumindo o ocorrido. */
    resumoIa?: string;
};

/**
 * Representa a bolha de mensagem na interface do Chatbot.
 */
export type Message = {
    /** Timestamp ou identificador único da mensagem. */
    id: number;
    /** Define a origem e o estilo da bolha de mensagem na interface. */
    role: "bot" | "user";
    /** O conteúdo em texto da mensagem. */
    text: string;
};