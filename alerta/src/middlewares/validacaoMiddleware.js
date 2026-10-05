const {body, validationResult} = require('express-validator');

const verificarErros = (req, res, next) => {

  const erros = validationResult(req);

  if(!erros.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação.',
    });
  }

  next();
};

const validarRegistro = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório.')              
    .isLength({min: 2}).withMessage('Nome deve ter no mínimo 2 caracteres.'),

  body('email').trim().notEmpty().withMessage('Email é obrigatório.')
    .isEmail().withMessage('Email válido é obrigatório.'),     

  body('senha').notEmpty().withMessage('Senha é obrigatória.')
    .isLength({min: 8}).withMessage('Senha deve ter no mínimo 8 caracteres.'),

  verificarErros,
];

const validarLogin = [
  body('email').trim().notEmpty().withMessage('Email é obrigatório.')
    .isEmail().withMessage('Email válido é obrigatório.'),

  body('senha')
    .notEmpty().withMessage('Senha é obrigatória.'),

  verificarErros,
];

const validarReporte = [
  body('titulo').trim().notEmpty().withMessage('Título é obrigatório.')
    .isLength({min: 5}).withMessage('Título deve ter no mínimo 5 caracteres.'),

  body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória.')
    .isLength({min: 10}).withMessage('Descrição deve ter no mínimo 10 caracteres.'),

  body('categoria').notEmpty().withMessage('Categoria é obrigatória.')
    .isMongoId().withMessage('Categoria deve ser um ID válido.'), 

  body('localizacao.coordinates').isArray({min: 2, max: 2}).withMessage('Coordenadas são obrigatórias [longitude, latitude].'),

  verificarErros,
];

const validarStatusReporte = [
  body('status').notEmpty().withMessage('Status é obrigatório.').isIn(['aberto', 'em_andamento', 'resolvido', 'fechado'])
    .withMessage('Status inválido. Use: aberto, em_andamento, resolvido ou fechado.'),

  verificarErros,
];

const validarComentario = [
  body('conteudo').trim()
    .notEmpty().withMessage('Conteúdo do comentário é obrigatório.'),

  verificarErros,
];

const validarCategoria = [
  body('nome').trim()
    .notEmpty().withMessage('Nome da categoria é obrigatório.'),

  verificarErros,
];

const validarAlterarPerfil = [
  body('perfil').notEmpty().withMessage('Perfil é obrigatório.').isIn(['cidadao', 'moderador', 'admin'])
    .withMessage('Perfil inválido. Use: cidadao, moderador ou admin.'),

  verificarErros,
];

const validarAlterarStatus = [
  body('ativo').notEmpty().withMessage('O campo ativo é obrigatório.')
    .isBoolean().withMessage('O campo ativo deve ser true ou false.'), 

  verificarErros,
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarReporte,
  validarStatusReporte,
  validarComentario,
  validarCategoria,
  validarAlterarPerfil,
  validarAlterarStatus,
};
