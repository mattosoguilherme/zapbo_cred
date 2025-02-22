const { Boom } = require("@hapi/boom"); // Utilizada para erros mais estruturados (não está sendo usada diretamente aqui)
const {
  DisconnectReason,
  useMultiFileAuthState,
  makeWASocket,
  Browsers,
} = require("@whiskeysockets/baileys"); // Baileys é a biblioteca que implementa o WhatsApp Web API

// Declaração de variáveis globais
let sock = null; // Variável para armazenar a instância do socket do WhatsApp
let state = null; // Variável para armazenar o estado de autenticação
let saveCreds = null; // Função para salvar as credenciais de autenticação
let isConnected = false; // Flag para indicar se a conexão com o WhatsApp foi estabelecida

// Função assíncrona para conectar ao WhatsApp
const connect = async () => {
  // Obtém o estado de autenticação, que pode ser salvo em múltiplos arquivos
  const authState = await useMultiFileAuthState("auth_info_baileys");
  state = authState.state; 
  saveCreds = authState.saveCreds; 

  // Criação da instância do socket para comunicação com o WhatsApp
  sock = makeWASocket({
    auth: state, 
    printQRInTerminal: true, // Exibe o QR Code no terminal para escanear
    browser: Browsers.windows("Desktop"), // Define o nome do browser (usado para conectar)
  });

  // Evento que captura as mensagens de WhatsApp
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.remoteJid === "status@broadcast") {
        // Ignora as mensagens de status do WhatsApp (broadcasts)
        console.log("📢 Ignorando mensagem de Status...");
        return; 
      }
    }
  });

  // Evento que lida com atualizações de conexão
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const errorCode = lastDisconnect?.error?.output?.statusCode; // Captura o código de erro da desconexão
      console.log(`⚠️ Conexão fechada. Código: ${errorCode}`);

      if (errorCode === DisconnectReason.loggedOut) {
        console.log("🚨 Usuário deslogado. Escaneie o QR Code novamente.");
        isConnected = false;
        return;
      }

      console.log("🔄 Tentando reconectar...");
      isConnected = false; 
      setTimeout(connect, 5000); 
    } else if (connection === "open") {
 
      console.log("✅ Conexão estabelecida!");
      console.log('Número logado:', sock.user.id.split(':')[0]); 
      isConnected = true; 
    }
  });

  // Atualiza as credenciais de autenticação quando há alterações
  sock.ev.on("creds.update", saveCreds);
};

// Função assíncrona para aguardar a conexão ser estabelecida
const waitForConnection = async () => {
  let attempts = 0; // Contador de tentativas
  while (!isConnected) {
    if (attempts >= 15) throw new Error("⏳ Tempo limite atingido para conexão!"); // Se não conectar em 15 tentativas, lança erro
    console.log("⏳ Aguardando conexão...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Aguarda 2 segundos antes de tentar novamente
    attempts++; // Incrementa o contador de tentativas
  }
};

// Função assíncrona para enviar mensagens para um número específico
const sendBailey = async (number, message) => {
  if (!sock) throw new Error("🚫 Socket não inicializado."); 
  await waitForConnection(); // Aguarda a conexão ser estabelecida antes de enviar

  try {
    console.log(`📤 Enviando mensagem para ${number}...`);
    // Envia a mensagem usando o socket
    await sock.sendMessage(`${number}@s.whatsapp.net`, { text: message });
    console.log(`✅ Mensagem enviada para ${number}`);
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem:", error.message || error); // Trata erros ao enviar mensagem
    throw error; // Relança o erro
  }
};

// Função para enviar uma mensagem específica para o administrador
const sendAdm = async (message) => {
  
  await sendBailey(sock.user.id.split(':')[0], message);
};

// Exporta as funções para uso externo
module.exports = {
  connect, 
  sendBailey, 
  sendAdm, 
};
