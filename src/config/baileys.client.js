const fs = require("fs");
const path = require("path");
const {
  DisconnectReason,
  useMultiFileAuthState,
  makeWASocket,
  Browsers,
} = require("@whiskeysockets/baileys");

const AUTH_FOLDER = "auth_info_baileys";

// Garante que a pasta de autenticação exista
if (!fs.existsSync(path.resolve(AUTH_FOLDER))) {
  fs.mkdirSync(path.resolve(AUTH_FOLDER), { recursive: true });
  console.log("📂 Pasta de autenticação criada:", path.resolve(AUTH_FOLDER));
}

// Variáveis globais
let sock = null;
let state = null;
let saveCreds = null;
let isConnected = false;
let connecting = false; // evita chamadas paralelas

// Função principal de conexão ao WhatsApp
const connect = async () => {
  if (connecting || isConnected) return;
  connecting = true;

  try {
    console.log("🔐 Carregando sessão de autenticação de:", path.resolve(AUTH_FOLDER));
    const authState = await useMultiFileAuthState(AUTH_FOLDER);
    state = authState.state;
    saveCreds = authState.saveCreds;

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: Browsers.windows("Desktop"),
    });

    // Evento: recebimento de mensagens
    sock.ev.on("messages.upsert", async ({ messages }) => {
      for (const msg of messages) {
        if (msg.key.remoteJid === "status@broadcast") {
          console.log("📢 Ignorando mensagem de Status...");
          return;
        }

        // Tratar mensagens recebidas aqui
      }
    });

    // Evento: atualização de conexão
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const errorCode = lastDisconnect?.error?.output?.statusCode;
        console.log(`⚠️ Conexão fechada. Código: ${errorCode}`);

        if (errorCode === DisconnectReason.loggedOut) {
          console.log("🚨 Usuário deslogado. Fazendo backup e limpando autenticação...");

          const backupPath = `${AUTH_FOLDER}_backup_${Date.now()}`;
          try {
            fs.cpSync(path.resolve(AUTH_FOLDER), backupPath, { recursive: true });
            console.log(`🛟 Backup da sessão salvo em: ${backupPath}`);
          } catch (e) {
            console.error("❌ Erro ao fazer backup:", e.message || e);
          }

          fs.rmSync(path.resolve(AUTH_FOLDER), { recursive: true, force: true });
          isConnected = false;
          connecting = false;
          setTimeout(connect, 3000);
          return;
        }

        console.log("🔄 Tentando reconectar...");
        isConnected = false;
        connecting = false;
        setTimeout(connect, 5000);
      } else if (connection === "open") {
        console.log("✅ Conexão estabelecida!");
        console.log("📱 Número logado:", sock.user.id.split(":")[0]);
        isConnected = true;
        connecting = false;
      }
    });

    // Evento: atualização de credenciais
    sock.ev.on("creds.update", async () => {
      await saveCreds();
      console.log("💾 Credenciais atualizadas.");
    });

  } catch (error) {
    console.error("❌ Erro ao conectar:", error.message || error);
    connecting = false;
  }
};

// Aguarda conexão ativa
const waitForConnection = async () => {
  let attempts = 0;

  while (!isConnected) {
    if (attempts >= 15) {
      throw new Error("⏳ Tempo limite atingido para conexão!");
    }

    console.log("⏳ Aguardando conexão...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }
};

// Envia mensagem para um número específico
const sendBailey = async (number, message) => {
  if (!sock) throw new Error("🚫 Socket não inicializado.");
  await waitForConnection();

  try {
    const jid = `55${number}@s.whatsapp.net`;
    console.log(`📤 Enviando mensagem para ${number}...`);

    await sock.sendMessage(jid, { text: message });

    console.log(`✅ Mensagem enviada para ${number} às ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem:", error.message || error);
    throw error;
  }
};

// Envia mensagem para o número do administrador
const sendAdm = async (message) => {
  await sendBailey(11992767398, message);
};

// Exporta as funções
module.exports = {
  connect,
  sendBailey,
  sendAdm,
};
