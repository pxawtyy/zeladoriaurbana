import { Chamado } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
    criarChamado: async (dados: any) => {
    const res = await fetch(`${API_URL}/api/chamados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    if (!res.ok) throw new Error("Erro ao criar chamado na API");
    return res.json();
    },

    listarChamados: async (): Promise<Chamado[]> => {
    const res = await fetch(`${API_URL}/api/chamados`);
    if (!res.ok) throw new Error("Erro ao buscar chamados");
    return res.json();
    },

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