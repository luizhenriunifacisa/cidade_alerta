const mongoose = require('mongoose');

const statusHistorico = new mongoose.Schema({

  reporte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reporte',
    required: true,
  },

  statusAnterior: {
    type: String,
    required: true,
  },

  statusAtual: {
    type: String,
    required: true,
  },

  mudadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },

  observacao: {
    type: String,
    trim: true,
    default: '',
  },

  dataMudanca: {
    type: Date,
    default: Date.now,
  },
});

statusHistorico.index({
  reporte: 1,
  dataMudanca: -1
});

module.exports = mongoose.model('StatusHistorico', statusHistorico);
