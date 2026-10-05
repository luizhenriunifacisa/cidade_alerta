const mongoose = require('mongoose');

const comentario = new mongoose.Schema({
    reporte: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Reporte',                       
      required: [true, 'Reporte é obrigatório'],
    },

    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },

    conteudo: {
      type: String,
      required: [true, 'Conteúdo do comentário é obrigatório'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

comentario.index({
  reporte: 1,
  createdAt: -1
});

module.exports = mongoose.model('Comentario', comentario);
