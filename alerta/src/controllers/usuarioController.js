const Usuario = require('../models/Usuario');

const listarUsuarios = async(req, res) => {

  try{

    const usuarios = await Usuario.find().select('-__v');

    res.json({
      success: true,
      data: {usuarios}
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários.',
      error: erro.message
    });
  }
}

const obterUsuario = async(req, res) => {

  try{

    const usuario = await Usuario.findById(req.params.id).select('-__v');

    if(!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    res.json({
      success: true,
      data: {usuario},
    });

  }catch(erro) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: erro.message
    });
  }
}

const atualizarUsuario = async(req, res) => {

  try{

    const {id} = req.params;

    if(req.usuario._id.toString() !== id && req.usuario.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este usuário',
      })
    }

    const {nome, email} = req.body;

    const dadosAtualizacao = {}

    if(nome) {
      dadosAtualizacao.nome = nome;
    }

    if(email) {
      dadosAtualizacao.email = email;
    }

    const usuario = await Usuario.findByIdAndUpdate(id, dadosAtualizacao, {
      new: true,
      runValidators: true
    }).select('-__v');

    if(!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.',
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso.',
      data: {usuario}
    });

  }catch(erro) {
    return res.status(500).json({
      success: false,
      message: 'Não é possível atualizar esse usuário',
      error: erro.message,
    });
  }
} 

const alterarPerfil = async(req, res) => {

  try{

    const {perfil} = req.body;

    if(!['cidadao', 'moderador', 'admin'].includes(perfil)) {
      return res.status(400).json({
        success: false,
        message: 'Perfil inválido. Use: cidadao, moderador e admin',
      });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      {perfil},
      {
        new: true,        
        runValidators: true 
      }).select('-__v');

    if(!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      message: `Perfil do usuário alterado para ${perfil}`,
      data: {usuario},
    });

  }catch(erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar perfil do usuário.',
      error: erro.message,
    });

  }
}

const alterarStatus = async(req, res) => {

  try{

    const {ativo} = req.body;

    if(typeof ativo !== 'boolean') {
      return res.status(404).json({
        success: false,
        message: 'O campo deve ser false ou true',
      });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      {ativo},
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');

    if(!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      message: `Usuário ${ativo ? 'ativado':'desativado'} com sucesso`,
      data: {usuario},
    });

  }catch(erro) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao alterar status do usuário',
      error: erro.message,
    });
  }
}

module.exports = {listarUsuarios, obterUsuario, alterarStatus, alterarPerfil, atualizarUsuario}