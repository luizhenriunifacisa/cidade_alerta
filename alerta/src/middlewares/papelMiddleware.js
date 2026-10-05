const papelMiddleware = (...funcoesPermitidas) => {

  return (req, res, next) => {

    if(!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Usuário não autenticado.',
      });
    }

    if(!funcoesPermitidas.includes(req.usuario.perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
      });
    }

    next();
  };
};

module.exports = papelMiddleware;
