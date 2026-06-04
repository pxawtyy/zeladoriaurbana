import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from 'baileys';
import pino from 'pino';

const app = express();
app.use(cors());
app.use(express.json());

let sock;
const PORT = 3001;
const logger = pino({ level: 'silent' });
let pairingRequested = false;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`[BOT] Iniciando WhatsApp v${version.join('.')}`);

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: Browsers.ubuntu('Chrome')
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            console.log('[BOT] Preparando requisição segura do código...');
            
            setTimeout(async () => {
                try {
                    const phoneNumber = process.env.BOT_NUMBER; 
                    const code = await sock.requestPairingCode(phoneNumber);
                    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                    console.log(`\nCÓDIGO DE PAREAMENTO: ${formattedCode}\n`);
                } catch (error) {
                    console.error('[BOT] Falha ao solicitar código:', error);
                    pairingRequested = false;
                }
            }, 2000); 
        }

        if (connection === 'open') {
            console.log('[BOT] ✅ WhatsApp conectado e pronto!');
            pairingRequested = false; 
        } 
        else if (connection === 'close') {
            pairingRequested = false; 
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 403;
            
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            }
        }
    });
}

app.post('/send-message', async (req, res) => {
    const { numero, mensagem } = req.body;
    if (!numero || !mensagem) return res.status(400).json({ erro: 'Faltam dados.' });

    try {
        const numeroFormatado = `${numero}@s.whatsapp.net`;
        await sock.sendMessage(numeroFormatado, { text: mensagem });
        console.log(`[BOT] Notificação enviada para ${numero}`);
        return res.status(200).json({ sucesso: true });
    } catch (error) {
        console.error('[BOT] Erro ao enviar mensagem:', error);
        return res.status(500).json({ erro: 'Falha.' });
    }
});

app.listen(PORT, () => {
    console.log(`[SERVIÇO] Rodando na porta ${PORT}`);
    connectToWhatsApp();
});