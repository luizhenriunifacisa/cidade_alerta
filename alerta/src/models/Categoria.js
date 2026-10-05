const mongoose = require('mongoose');

const categoria = new mongoose.Schema({
    nome: {
      type: String,
      required: [true, 'Nome da categoria é obrigatório'],
      unique: true, 
      trim: true,   
    },

    descricao: {
      type: String,
      trim: true,
      default: '',
    },

    isAtivo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Categoria', categoria);
