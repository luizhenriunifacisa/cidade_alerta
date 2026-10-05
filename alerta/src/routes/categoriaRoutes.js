const express = require('express');

const router = express.Router();

const { criarCategoria, listarCategorias, obterCategoria, atualizarCategoria, deletarCategoria } = require('../controllers/categoriaController');
const authMiddleware = require('../middlewares/authMiddleware');
const papelMiddleware = require('../middlewares/papelMiddleware');
const { validarCategoria } = require('../middlewares/validacaoMiddleware');

router.get('/', listarCategorias);

router.get('/:id', obterCategoria);

router.post('/', authMiddleware, papelMiddleware('admin'), validarCategoria, criarCategoria);

router.put('/:id', authMiddleware, papelMiddleware('admin'), atualizarCategoria);

router.delete('/:id', authMiddleware, papelMiddleware('admin'), deletarCategoria);

module.exports = router;
