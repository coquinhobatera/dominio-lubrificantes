const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

let sock;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n--- ESCANEIE O QR CODE ABAIXO COM O WHATSAPP DA LOJA ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ WhatsApp conectado com sucesso!');
        }
    });
}

// Endpoint que seu Spring Boot vai chamar para enviar mensagens
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    try {
        // Sanitiza o número deixando apenas dígitos
        const formattedPhone = phone.replace(/\D/g, '');

        // Consulta no servidor do WhatsApp qual o JID real registrado para esse número
        const [result] = await sock.onWhatsApp(formattedPhone);

        if (!result || !result.exists) {
            console.error(`[ERRO] O número ${formattedPhone} não possui conta ativa no WhatsApp.`);
            return res.status(404).json({ error: 'Número não registrado no WhatsApp' });
        }

        // Usa o JID oficial retornado pelo WhatsApp (resolve a questão do 9º dígito)
        const jid = result.jid;

        await sock.sendMessage(jid, { text: message });
        console.log(`[ENVIADO] Mensagem enviada com sucesso para JID: ${jid}`);

        return res.status(200).json({ status: 'SUCCESS', message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return res.status(500).json({ error: 'Falha ao enviar mensagem via WhatsApp' });
    }
});

app.listen(8081, () => {
    console.log('🚀 Servidor WhatsApp rodando na porta 8081');
    connectToWhatsApp();
});