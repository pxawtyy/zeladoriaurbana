import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from 'baileys';
import pino from 'pino';

const logger = pino({ level: 'silent' });

let sock;
let pairingRequested = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
export let isWhatsAppConnected = false;

export const connectToWhatsApp = async () => {
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
            isWhatsAppConnected = true;
            reconnectAttempts = 0;
        } 
        else if (connection === 'close') {
            isWhatsAppConnected = false;
            pairingRequested = false; 
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 403;
            
            if (shouldReconnect) {
                reconnectAttempts++;
                
                if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                    const tempoEsperaMs = Math.pow(2, reconnectAttempts - 1) * 5000; 
                    
                    console.log(`[BOT] Conexão caiu. Tentando reconectar em ${tempoEsperaMs / 1000}s (Tentativa ${reconnectAttempts} de ${MAX_RECONNECT_ATTEMPTS})...`);
                    
                    setTimeout(connectToWhatsApp, tempoEsperaMs);
                } else {
                    console.error('[BOT] 🚨 FALHA CRÍTICA: Limite máximo de reconexões atingido.');
                }
            } else {
                console.log('[BOT] Desconectado permanentemente.');
            }
        }
    });
}

export const sendWhatsAppMessage = async (numero, mensagem) => {
    if (!sock) throw new Error("WhatsApp não está conectado ao servidor.");
    
    let numeroLimpo = String(numero).replace(/\D/g, '');

    if (!numeroLimpo.startsWith('55')) {
        numeroLimpo = `55${numeroLimpo}`;
    }

    const numeroFormatado = `${numeroLimpo}@s.whatsapp.net`;
    
    await sock.sendMessage(numeroFormatado, { text: mensagem });
    return numeroFormatado;
};