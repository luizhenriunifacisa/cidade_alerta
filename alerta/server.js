require('dotenv').config();

const criarApp = require('./src/app');

const conectarBanco = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {

  try {

    await conectarBanco();

    const app = await criarApp();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error.message);
  }
}

iniciarServidor();
