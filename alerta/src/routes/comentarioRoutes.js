const express = require('express');

const router = express.Router();

const { criarComentario, listarComentarios, deletarComentario } = require('../controllers/comentarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validarComentario } = require('../middlewares/validacaoMiddleware');

router.post('/reportes/:id/comentarios', authMiddleware, validarComentario, criarComentario);

router.get('/reportes/:id/comentarios', listarComentarios);

router.delete('/comentarios/:id', authMiddleware, deletarComentario);

module.exports = router;
