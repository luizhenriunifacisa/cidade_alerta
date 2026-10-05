const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {

  try {

    const headerAuth = req.headers.authorization;

    if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.',
      });
    }

    const token = headerAuth.split(' ')[1];

    const decodificar = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decodificar.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Usuário não encontrado.',
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.',
      });
    }

    req.usuario = usuario;
    next();

  } catch (erro) {
    if (erro.name === 'JsonWebTokenError' || erro.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: erro.name === 'TokenExpiredError' ? 'Token expirado. Faça login novamente.' : 'Token inválido.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
    });
  }
};

module.exports = authMiddleware;
