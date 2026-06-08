import 'dotenv/config';
import app from './src/server.js';
import { connectToWhatsApp } from './src/services/whatsapp.js';

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`[SERVIÇO] API do Bot rodando na porta ${PORT}`);
    
    connectToWhatsApp();
});