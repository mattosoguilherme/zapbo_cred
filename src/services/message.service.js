const prisma = require("../config/prisma.client");
const { sendBailey, sendAdm } = require("../config/baileys.client");
const fs = require("fs");
const path = require("path");

class MessageService {
  constructor() {
    this.startHour = 6; // Hora de início (7h da manhã, por exemplo)
    this.endHour = 22; // Hora de término (21h, por exemplo)
    this.delay = 4 * 60 * 1000; // 4 minutos em milissegundos (240000 ms)
  }

  async create_user(
    user = {
      nome: "",
      cpf: 0,
      telefone_principal: 0,
      telefones_secundarios: [0],
    }
  ) {
    let telefones = [];

    telefones.push(user.telefone_principal);
    telefones = [...telefones, ...user.telefones_secundarios];

    const verifyCpf = await prisma.user.findUnique({
      where: { cpf: String(user.cpf) },
    });

    if (verifyCpf) {
      throw new Error(`CPF ${user.cpf} já cadastrado`);
    }

    for (const t in telefones) {
      const verifyTelefone = await prisma.agenda.findUnique({
        where: { telefone: `55${t}` },
      });
      if (verifyTelefone) {
        throw new Error(`Telefone ${t} já cadastrado`);
      }
    }

    return await prisma.user.create({
      data: {
        nome: user.nome,
        cpf: String(user.cpf),
        Agenda: {
          create: telefones.map((t = 0) => ({
            telefone: `55${t}`,
          })),
        },
      },
    });
  }

  async generateDailyReport(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Início do dia
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Fim do dia

    const totalMessages = await prisma.messageLog.count({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const relatorio = {
      date: startDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
      totalMessages: totalMessages,
    };

    await sendAdm(
      `Sr. Mattoso,\n\nsegue o relatório do dia *${relatorio.date}*:\n\n*${relatorio.totalMessages}* mensagens enviadas.\n\n*PRODUTO: RENDA EXTRA*`
    );
  }

  async relatoriofimdodia() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Início do dia
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Fim do dia

    const totalMessages = await prisma.agenda.count({
      where: {
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    await sendAdm(
      `Sra. Romina, boa noite!\n\nZapbo chegou no fim do espediente.\n\nsegue o relatório do dia:\n\n*${totalMessages}* mensagens enviadas.\n\n*PRODUTO: FGTS*\n\nLembra o Guilherme de programar o envio de mensagens para amanhã.\n\n Ótima noite!`
    );
  }

  async addNumber(number) {
    const existingContact = await prisma.contact.findUnique({
      where: { number: number },
    });

    if (existingContact) {
      console.error(`numero ${number} já cadastrado`);
      throw new Error(`numero ${number} já cadastrado`);
    }

    return await prisma.contact.create({ data: { number } });
  }

  async getNumbers() {
    return await prisma.agenda.findMany();
  }

  async send(mensagem) {
    const msg = "TA FUNCIONANDO";

    await sendAdm(msg);
  }

  // Função para verificar se estamos dentro do horário permitido
  isWithinSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.startHour && currentHour <= this.endHour;
  }

  async sendToMany() {
    // // Espera até o horário de início para começar
    // await this.waitUntilStartHour();

    // const teste = [
    //   { number: "5511992767398", id: 1 },
    //   { number: "5511965888365", id: 2 },
    //   { number: "5511992767398", id: 3 },
    // ];

    const contatos = (await this.getNumbers()).filter(
      (agenda) => agenda.sended === false
    );
   

    const msg =
      "💰 **Precisando de dinheiro rápido?** 💰\n\n🚀 Saque seu **FGTS bloqueado** em menos de **10 minutos** – mesmo com cadeado! ✅\n\n🔥 **Sem burocracia, sem complicação!** 🔥\n\n📲 Chame agora no WhatsApp e resolva sua vida financeira:\n\n👉 [CLIQUE AQUI](https://wa.me/5511916515603) 👈";

    while (true) {

      if (!this.isWithinSchedule()) {
        console.log("Fora do horário permitido.");

        await new Promise((resolve) => setTimeout(resolve, 4 * 60 * 1000)); // Espera 5min e tenta novamente;
        continue; // Volta ao início do loop para verificar o horário novamente
      }

      console.log("Enviando mensagens...aguarde 4 minutos");

      for (let contato of contatos) {
        await sendBailey(contato.telefone, msg)
          .then(async () => {

            await prisma.agenda.update({
              where: { id: contato.id },
              data: { sended: true },
            });

            console.log(
              `Mensagem enviada para ${
                contato.telefone
              } às ${new Date().toLocaleTimeString()}`
            );
          })
          .catch((error) => {
            console.log("Erro ao enviar mensagem:", error);
          });

        // Espera 2 minutos antes de enviar a próxima mensagem
        await new Promise((resolve) => setTimeout(resolve, 4 * 60 * 1000));

        if (!this.isWithinSchedule()) {
          console.log("por hoje deu...");
          await this.relatoriofimdodia();
          break;
        }
      }

      break;
    }
  }

  countFilesInDirectory(directoryPath) {
    try {
      // Lê o diretório de forma síncrona e filtra apenas arquivos
      const files = fs.readdirSync(directoryPath);
      const fileCount = files.filter((file) => {
        const filePath = path.join(directoryPath, file);
        return fs.lstatSync(filePath).isFile();
      }).length;

      console.log(
        `Número de arquivos na pasta '${directoryPath}': ${fileCount}`
      );
      return fileCount;
    } catch (err) {
      console.error(`Erro ao ler o diretório: ${err.message}`);
      return 0; // Retorna 0 em caso de erro
    }
  }
}

module.exports = MessageService;
