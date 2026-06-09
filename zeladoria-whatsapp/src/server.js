import express from 'express';
import cors from 'cors';
import { sendWhatsAppMessage, isWhatsAppConnected } from './services/whatsapp.js';

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Middleware de segurança para proteger a API do bot.
 * Valida se a requisição contém o cabeçalho de autorização correto
 * utilizando o token secreto definido nas variáveis de ambiente.
 * * @param {import('express').Request} req - Objeto da requisição.
 * @param {import('express').Response} res - Objeto da resposta.
 * @param {import('express').NextFunction} next - Função callback para avançar no pipeline.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const secretToken = process.env.API_SECRET_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
        return res.status(401).json({ erro: 'Acesso não autorizado.' });
    }

    next();
};

/**
 * Rota para envio de notificações via WhatsApp.
 * Verifica o status da conexão do bot antes de tentar disparar a mensagem.
 * * @name POST /send-message
 * @function
 * @param {string} req.body.numero - Número do destinatário (com ou sem formatação).
 * @param {string} req.body.mensagem - Texto que será enviado ao cidadão.
 */
app.post('/send-message', authMiddleware, async (req, res) => {
    if (!isWhatsAppConnected) {
        return res.status(503).json({ 
            erro: 'O serviço do WhatsApp ainda está inicializando ou perdeu a conexão. Tente novamente em instantes.' 
        });
    }

    const { numero, mensagem } = req.body;

    if (!numero || !mensagem) {
        return res.status(400).json({ erro: 'Número e mensagem são obrigatórios.' });
    }

    try {
        const numeroFormatado = await sendWhatsAppMessage(numero, mensagem);
        console.log(`[BOT] Notificação enviada com sucesso para ${numeroFormatado}`);
        return res.status(200).json({ sucesso: true });
    } catch (error) {
        console.error('[BOT] Erro ao enviar mensagem:', error);
        return res.status(500).json({ erro: 'Falha ao enviar notificação. Verifique a conexão.' });
    }
});

export default app;