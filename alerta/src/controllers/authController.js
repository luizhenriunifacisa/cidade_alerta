const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');

const gerarToken = (idUsuario) => {
  return jwt.sign({ id: idUsuario }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const registro = async (req, res) => {

  try {

    const { nome, email, senha } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está cadastrado.',
      });
    }

    const usuario = await Usuario.create({ nome, email, senha });

    const token = gerarToken(usuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso.',
      data: {
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
        },
        token,
      },
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário.',
      error: erro.message,
    });
  }
};

const login = async (req, res) => {

  try {

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios.',
      });
    }

    const usuario = await Usuario.findOne({ email }).select('+senha');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.',
      });
    }

    const senhaCorreta = await usuario.comparePassword(senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    const token = gerarToken(usuario._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
        },
        token,
      },
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login.',
      error: erro.message,
    });
  }
};

const perfil = async (req, res) => {

  try {

    res.json({
      success: true,
      data: {
        usuario: {
          id: req.usuario._id,
          nome: req.usuario.nome,
          email: req.usuario.email,
          perfil: req.usuario.perfil,
          ativo: req.usuario.ativo,
          criadoEm: req.usuario.createdAt,
          atualizadoEm: req.usuario.updatedAt,
        },
      },
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil.',
      error: erro.message,
    });
  }
};

module.exports = { registro, login, perfil };
