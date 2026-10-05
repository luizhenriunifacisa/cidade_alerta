const express = require('express');

const router = express.Router();

const { listarUsuarios, obterUsuario, atualizarUsuario, alterarPerfil, alterarStatus } = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const papelMiddleware = require('../middlewares/papelMiddleware');
const { validarAlterarPerfil, validarAlterarStatus } = require('../middlewares/validacaoMiddleware');

router.use(authMiddleware);

router.get('/', papelMiddleware('admin'), listarUsuarios);

router.get('/:id', papelMiddleware('admin'), obterUsuario);

router.put('/:id', atualizarUsuario);

router.patch('/:id/papel', papelMiddleware('admin'), validarAlterarPerfil, alterarPerfil);

router.patch('/:id/status', papelMiddleware('admin'), validarAlterarStatus, alterarStatus);

module.exports = router;
