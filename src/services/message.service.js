const prisma = require("../config/prisma.client");
const { sendBailey, sendAdm } = require("../config/baileys.client");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

class MessageService {
  constructor() {
    this.startHour = 6; // Hora de início (7h da manhã, por exemplo)
    this.endHour = 1; // Hora de término (21h, por exemplo)
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

  // Função para verificar se estamos dentro do horário permitido
  isWithinSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.startHour && currentHour <= this.endHour;
  }

  async sendToMany() {
    const contatos = await prisma.user.findMany({
      where: { sended: false },
      include: { pedidos: true },
    });

    // while (true) {
    //   if (!this.isWithinSchedule()) {
    //     console.log("Fora do horário permitido.");

    //     await new Promise((resolve) => setTimeout(this.delay)); // Espera 5min e tenta novamente;
    //     continue; // Volta ao início do loop para verificar o horário novamente
    //   }

    console.log("Enviando mensagens...");

    for (let contato of contatos) {
      const msg = `
  📋 *COMANDA DE PEDIDO* 📋
  
  👤 Cliente: ${contato.nome}
  
  📦 *Pedidos:*
  ${contato.pedidos
    .map(
      (item) =>
        `➡️ ${item.quantidade}x ${item.produto} - R$ ${item.total},00 (Data: ${item.data})`
    )
    .join("\n")}
  
  💰 *Total: R$ ${contato.total_comanda},00*
  
  Obrigado pela preferência! 😊🍬
  `;

      await sendBailey(contato.telefone, msg)
        .then(async () => {
          await prisma.user.update({
            where: { id: contato.id },
            data: { sended: true },
          });
        })
        .catch((error) => {
          console.log("Erro ao enviar mensagem:", error);
        });

      // Espera 4 minutos antes de enviar a próxima mensagem
      await new Promise((resolve) => setTimeout(resolve, this.delay));

      //   if (!this.isWithinSchedule()) {
      //     console.log("por hoje deu...");
      //     await this.endofdayreport();
      //     break;
      //   }
    }

    //   break;
    // }
  }
}

module.exports = MessageService;
