const express = require('express');

const router = express.Router();

const { registro, login, perfil } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validarRegistro, validarLogin } = require('../middlewares/validacaoMiddleware');

router.post('/registrar', validarRegistro, registro);

router.post('/login', validarLogin, login);

router.get('/perfil', authMiddleware, perfil);

module.exports = router;
