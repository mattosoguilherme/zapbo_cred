const prisma = require("../config/prisma.client");
const { sendBailey, sendAdm } = require("../config/baileys.client");
const fs = require("fs");
const path = require("path");

class MessageService {
  constructor() {
    this.startHour = 7; // Hora de início (7h da manhã, por exemplo)
    this.endHour = 21; // Hora de término (21h, por exemplo)
    this.delay = 4 * 60 * 1000; // 2 minutos em milissegundos (240000 ms)
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

    const totalMessages = await prisma.messageLog.count({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    await sendAdm(
      `Sr. Mattoso, boa noite\n\nFim do espediente.\n\nsegue o relatório do dia:\n\n*${totalMessages}* mensagens enviadas.\n\n*PRODUTO: RENDA EXTRA*`
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
    return await prisma.contacts.findMany();
  }

  async send(mensagem) {
    const msg =
      "💸 Ganhe uma Renda Extra de até R$ 70.000,00! 💸\n\nVocê tem nome limpo, tem mais de 25 anos e, de preferência, CNH? Então, você pode aproveitar essa oportunidade exclusiva para gerar uma renda extra rápida e segura!\n\n✅ Possibilidade de Ganhos: de R$ 5.000,00 a R$ 70.000,00!\n\n✅ Prazo: Apenas 24h a 48h dias úteis para receber.\n\n✅ Simples, rápido e com total transparência.\n\nComo Funciona?Você colabora ajudando outras pessoas a atingirem seus objetivos financeiros e, em troca, recebe sua parte de forma garantida. Tudo é feito com respaldo e clareza!\n\n👉 Transforme seu potencial em ganhos reais!\n\n📩 Entre em contato agora e saiba mais!Essa pode ser a oportunidade que você estava esperando.\n\n🚀 Não perca tempo! Seu próximo passo para o sucesso começa aqui.";

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

    const teste = [
      { number: "5511992767398", id: 1 },
      { number: "5511992767398", id: 2 },
      { number: "5511992767398", id: 3 },
    ];

    const contatos = (await this.getNumbers()).filter(
      (objeto) => objeto.status === "PENDENTE" || objeto.status === "PEDDING"
    );

    const msg =
      "💸 Ganhe uma Renda Extra de até R$ 70.000,00! 💸\n\nVocê tem nome limpo, tem mais de 25 anos e, de preferência, CNH? Então, você pode aproveitar essa oportunidade exclusiva para gerar uma renda extra rápida e segura!\n\n✅ Possibilidade de Ganhos: de R$ 5.000,00 a R$ 70.000,00!\n✅ Prazo: Apenas 3 a 5 dias úteis para receber.\n✅ Simples, rápido e com total transparência.\n\nComo Funciona?Você colabora ajudando outras pessoas a atingirem seus objetivos financeiros e, em troca, recebe sua parte de forma garantida. Tudo é feito com respaldo e clareza!\n\n👉 Transforme seu potencial em ganhos reais!\n📩 *Entre em contato agora e saiba mais!Essa pode ser a oportunidade que você estava esperando.*\n🚀 \n\nNão perca tempo! Corre que temos poucas vagas estou disponibilizando as ultimas vagas!!! \n\nResponda *Como participo?* que em alguns instantes um de nossos consultores irá te atender.";

    while (true) {
      if (!this.isWithinSchedule()) {
        console.log("Fora do horário permitido.");

        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000)); // Espera 5min e tenta novamente;
        continue; // Volta ao início do loop para verificar o horário novamente
      }

      console.log("Enviando mensagens...");

      for (let contato of contatos) {
        await sendBailey(contato.number, msg)
          .then(async () => {
            console.log(
              `Mensagem enviada para ${
                contato.number
              } às ${new Date().toLocaleTimeString()}`
            );

            await prisma.contacts.update({
              where: { id: contato.id },
              data: { status: "ENVIADO" },
            });
            await prisma.messagelogs.create({
              data: {
                contactId: contato.id,
                message: ` Mensagem enviada para ${
                  contato.number
                } às ${new Date().toLocaleTimeString()}`,
              },
            });
          })
          .catch((error) => {
            console.log("Erro ao enviar mensagem:", error);
          });

        // Espera 2 minutos antes de enviar a próxima mensagem
        await new Promise((resolve) => setTimeout(resolve, this.delay));

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
