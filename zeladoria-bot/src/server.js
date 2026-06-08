import express from 'express';
import cors from 'cors';
import { sendWhatsAppMessage, isWhatsAppConnected } from './services/whatsapp.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/send-message', async (req, res) => {
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