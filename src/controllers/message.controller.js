// Importação de serviços e módulos necessários
const MessageService = require("../services/message.service"); // Importa o serviço de mensagens
const messageService = new MessageService(); // Cria uma instância do serviço de mensagens
const fs = require("fs"); // Módulo para trabalhar com o sistema de arquivos
const path = require("path"); // Módulo para manipulação de caminhos de arquivos e diretórios

// Classe que contém os métodos para controle das operações de mensagens
class MessageController {
  // Função para adicionar números a partir de um arquivo JSON
  async addNumber(req, res) {
    try {
      const diretoryPath = "c:/arkg.solutions/solutions/zapbo_fgts/temps/";
      const file_path = path.join(diretoryPath, `dados_filtrados.json`);

      if (!fs.existsSync(file_path)) {
        throw new Error(`Arquivo não encontrado: ${file_path}`);
      }

      const fileData = await fs.promises.readFile(file_path, "utf-8");
      const clientes = JSON.parse(fileData);

      if (!Array.isArray(clientes) || clientes.length === 0) {
        return res
          .status(400)
          .json({ message: "Nenhum cliente encontrado no arquivo" });
      }

      const BATCH_SIZE = 10; // Controla a quantidade de requisições paralelas
      for (let i = 0; i < clientes.length; i += BATCH_SIZE) {
        await Promise.all(
          clientes
            .slice(i, i + BATCH_SIZE)
            .map((c) => messageService.create_user(c))
        );
      }

      res.status(200).json({ message: `Números adicionados com sucesso` });
    } catch (error) {
      res.status(500).json({ message: "Erro ao adicionar números", error });
      console.error(error);
    }
  }

  // Função para obter todos os números cadastrados
  async getNumbers(req, res) {
    const numbers = await messageService.getNumbers();

    res.status(200).send(numbers);
  }

  // Função para enviar uma mensagem
  async sendMessage(req, res) {
    const { message } = req.body;

    await messageService
      .send(message)
      .then(() => {
        res.status(200).json({ message: "Mensagem enviada com sucesso" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Erro ao enviar mensagem", error });
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
        res.status(500).json({ message: "Erro ao enviar mensagem", error });
      });
  }

  // Função para gerar um relatório diário com base na data fornecida
  async dailyReport(req, res) {
    const { mes, dia, ano } = req.body;

    const data = new Date(ano, mes - 1, dia);

    await messageService
      .generateDailyReport(data)
      .then(() =>
        res.status(200).json({ message: "Relatório gerado com sucesso" })
      )
      .catch((error) => {
        res.status(500).json({ message: "Erro ao gerar relatório", error });
      });
  }
}

module.exports = MessageController;
