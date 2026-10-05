const mongoose = require('mongoose');

const conectarBanco = async () => {

  try {

    const conexao = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Mongo conectado');

  }catch(error) {
    console.error(`Error ao conectar no mongo: ${error.message}`);
  }
}

module.exports = conectarBanco;
