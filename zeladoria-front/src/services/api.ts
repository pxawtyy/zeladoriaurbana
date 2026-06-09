import { Chamado } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Objeto centralizador das requisições HTTP (Fetch) para a API backend (C#).
 * Abstrai a lógica de rede para manter os componentes de UI limpos.
 */
export const api = {
    /**
     * Envia o payload com os dados coletados pelo chatbot para criar um novo protocolo no banco.
     * @param dados Objeto contendo nome, telefone, endereco, descricao, imagemUrl e historicoChat.
     * @returns A resposta da API contendo a mensagem de sucesso e o número do protocolo gerado.
     */
    criarChamado: async (dados: any) => {
        const res = await fetch(`${API_URL}/api/chamados`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!res.ok) throw new Error("Erro ao criar chamado na API");
        return res.json();
    },

    /**
     * Recupera a lista completa de chamados para exibição no painel administrativo.
     * @returns Um array tipado contendo objetos `Chamado`.
     */
    listarChamados: async (): Promise<Chamado[]> => {
        const res = await fetch(`${API_URL}/api/chamados`);
        if (!res.ok) throw new Error("Erro ao buscar chamados");
        return res.json();
    },

    /**
     * Solicita à API a alteração do status de uma ocorrência e o disparo do webhook de notificação.
     * @param protocolo O número identificador do chamado.
     * @param status O novo status a ser aplicado (ex: "Em andamento").
     * @returns Objeto contendo a mensagem de sucesso do backend.
     */
    atualizarStatus: async (protocolo: number, status: string) => {
        const res = await fetch(`${API_URL}/api/chamados/${protocolo}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });

        if (!res.ok) throw new Error("Erro ao atualizar status");
        return res.json();
    }
};