// Importação de serviços e módulos necessários
const MessageService = require("../services/message.service"); // Importa o serviço de mensagens
const messageService = new MessageService(); // Cria uma instância do serviço de mensagens
const fs = require("fs"); // Módulo para trabalhar com o sistema de arquivos
const path = require("path"); // Módulo para manipulação de caminhos de arquivos e diretórios

// Classe que contém os métodos para controle das operações de mensagens
class MessageController {
  // Função para adicionar números a partir de um arquivo JSON
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


  // Função para enviar uma mensagem para múltiplos destinatários
  async sendToMany(req, res) {
    await messageService
      .sendToMany()
      .then(() => {
        res.status(200).json({
          message: "Mensagens enviadas com sucesso",
        });
      })
      .catch((error) => {
        res.status(500).json({ message: error });
      });
  }
}

module.exports = MessageController;
