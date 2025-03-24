const prisma = require("../config/prisma.client");
const { sendBailey, sendAdm } = require("../config/baileys.client");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

class MessageService {
  constructor() {
    this.startHour = 14; // Hora de início (7h da manhã, por exemplo)
    this.endHour = 21; // Hora de término (21h, por exemplo)
    this.delay = 1 * 60 * 1000; // 4 minutos em milissegundos (240000 ms)
  }

  async create_user(
    user = {
      nome: "",
      telefone: 0,
      vendedor: "",
      sended: false,
      pedidos: [
        {
          quantidade: 0,
          produto: "",
          total: 0,
          data: "",
        },
      ],
      total_comanda: 0,
    }
  ) {
    // const existingContact = await prisma.user.findFirst({
    //   where: { telefone: user.telefone },
    // });

    // if (existingContact) {
    //   throw new Error(`numero ${user.telefone} já cadastrado`);
    // }

    const userCreated = await prisma.user
      .create({
        data: {
          nome: user.nome,
          telefone: String(user.telefone),
          vendedor: user.vendedor,
          sended: user.sended,
          pedidos: {
            create: user.pedidos.map((pedido) => ({
              quantidade: pedido.quantidade,
              produto: pedido.produto,
              total: pedido.total,
              data: pedido.data,
            })),
          },
          total_comanda: user.total_comanda,
        },
      })
      .then((userCreated) => {
        console.log("User created with success", userCreated);
      })
      .catch((error) => {
        console.log("Error to create user", error);
      });
  }

  async endofdayreport() {
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
    const contatos = (await this.getNumbers()).filter(
      (agenda) => agenda.sended === false
    );

    const msg =
      "💰 *Precisando de dinheiro rápido?* 💰\n\n🚀 Saque seu *FGTS bloqueado* em menos de *10 minutos* – mesmo com cadeado! ✅\n\n🔥 *Sem burocracia, sem complicação!* 🔥\n\n📲 Chame agora no WhatsApp e resolva sua vida financeira:\n\n👉[CLIQUE AQUI](https://wa.me/5511916515603) 👈";

    while (true) {
      if (!this.isWithinSchedule()) {
        console.log("Fora do horário permitido.");

        await new Promise((resolve) => setTimeout(resolve, this.delay)); // Espera 5min e tenta novamente;
        continue; // Volta ao início do loop para verificar o horário novamente
      }

    console.log("Enviando mensagens...");

      for (let contato of contatos) {
        await sendBailey(contato.telefone, msg)
          .then(async () => {
            await prisma.agenda.update({
              where: { id: contato.id },
              data: { sended: true },
            });
          })
          .catch((error) => {
            console.log("Erro ao enviar mensagem:", error);
          });

      // Espera 4 minutos antes de enviar a próxima mensagem
      await new Promise((resolve) => setTimeout(resolve, this.delay));

        if (!this.isWithinSchedule()) {
          console.log("por hoje deu...");
          // await this.endofdayreport();
          break;
        }
    }

      break;
    }
  }
}

module.exports = MessageService;
