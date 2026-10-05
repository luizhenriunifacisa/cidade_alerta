const mongoose = require('mongoose');

const reporte = new mongoose.Schema({

    titulo: {
      type: String,
      required: [true, 'Título do reporte é obrigatório'],
      trim: true,
    },

    descricao: {
      type: String,
      required: [true, 'Descrição do reporte é obrigatória'],
      trim: true,
    },

    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'Categoria é obrigatória'],
    },

    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },

    status: {
      type: String,
      enum: ['aberto', 'em_andamento', 'resolvido', 'fechado'], 
      default: 'aberto', 
    },

    localizacao: {
      type: {
        type: String,
        enum: ['Point'], 
        default: 'Point',
      },
      coordinates: {
        type: [Number], 
        required: [true, 'Coordenadas são obrigatórias'],
      },
    },

    endereco: {
      type: String,
      trim: true,
      default: '',
    },

    imagens: [
      {
        type: String, 
      },
    ],
  },
  {
    timestamps: true,
  }
);

reporte.index({ localizacao: '2dsphere' });

reporte.index({ status: 1 });

reporte.index({ categoria: 1 });

reporte.index({ autor: 1 }); 

reporte.index({ createdAt: -1 });

module.exports = mongoose.model('Reporte', reporte);
