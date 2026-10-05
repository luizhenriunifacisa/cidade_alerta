const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const usuario = new mongoose.Schema({

    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'], 
      trim: true, 
    },

    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,    
      lowercase: true, 
      trim: true,
    },

    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [8, 'Senha deve ter no mínimo 8 caracteres'],
      select: false,
    },

    perfil: {
      type: String,
      enum: ['cidadao', 'moderador', 'admin'], 
      default: 'cidadao', 
    },

    ativo: {
      type: Boolean,
      default: true, 
    },
  },
  {
    timestamps: true,
  }
);

usuario.pre('save', async function () {
  if (!this.isModified('senha')) return; 

  const encriptografia = await bcrypt.genSalt(10);

  this.senha = await bcrypt.hash(this.senha, encriptografia);
});

usuario.methods.comparePassword = async function (senhaFornecida) {
  return bcrypt.compare(senhaFornecida, this.senha);
};

module.exports = mongoose.model('Usuario', usuario);
