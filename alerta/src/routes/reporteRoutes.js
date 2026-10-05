const express = require('express');

const router = express.Router();

const { criarReporte, listarReportes, meusReportes, obterReporte, atualizarReporte, deletarReporte, alterarStatusReporte, obterHistorico } = require('../controllers/reporteController');
const authMiddleware = require('../middlewares/authMiddleware');
const papelMiddleware = require('../middlewares/papelMiddleware');
const { validarReporte, validarStatusReporte } = require('../middlewares/validacaoMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', listarReportes);

router.get('/autenticado', authMiddleware, meusReportes);

router.get('/:id', obterReporte);

router.get('/:id/historico', obterHistorico);

router.post('/', authMiddleware, upload.array('imagens', 5), validarReporte, criarReporte);

router.put('/:id', authMiddleware, atualizarReporte);

router.patch('/:id/status', authMiddleware, papelMiddleware('admin', 'moderador'), validarStatusReporte, alterarStatusReporte);

router.delete('/:id', authMiddleware, papelMiddleware('admin'), deletarReporte);

module.exports = router;
