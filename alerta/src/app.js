const express = require('express');

const cors = require('cors');

const path = require('path');

const configurarGraphQL = require('./graphql');

const rotasAuth = require('./routes/authRoutes');

const rotasUsuario = require('./routes/usuarioRoutes');

const rotasCategoria = require('./routes/categoriaRoutes');

const rotasReporte = require('./routes/reporteRoutes');

const rotasComentario = require('./routes/comentarioRoutes');

const rotasDashboard = require('./routes/dashboardRoutes');

const criarApp = async () => {

  const app = express();

  app.use(cors());

  app.use(express.json());

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'CidadeAlerta API está rodando!',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', rotasAuth);
  app.use('/api/usuarios', rotasUsuario);
  app.use('/api/categorias', rotasCategoria);
  app.use('/api/reportes', rotasReporte);
  app.use('/api', rotasComentario);
  app.use('/api/dashboard', rotasDashboard);

  await configurarGraphQL(app);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada.',
    });
  });

  app.use((erro, req, res, next) => {
    console.error(erro.stack);
    res.status(erro.status || 500).json({
      success: false,
      message: erro.message || 'Erro interno do servidor.',
    });
  });

  return app;
};

module.exports = criarApp;
