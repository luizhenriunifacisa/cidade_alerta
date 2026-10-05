const express = require('express');

const router = express.Router();

const { obterEstatisticas, obterPorCategoria, obterPorPeriodo } = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const papelMiddleware = require('../middlewares/papelMiddleware');

router.use(authMiddleware);

router.use(papelMiddleware('admin', 'moderador'));

router.get('/estatistica', obterEstatisticas);

router.get('/categoria', obterPorCategoria);

router.get('/periodo', obterPorPeriodo);

module.exports = router;
