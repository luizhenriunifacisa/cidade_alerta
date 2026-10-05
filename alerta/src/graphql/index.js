const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { graphqlUploadExpress } = require('graphql-upload-minimal');

const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');

const typeDefs = require('./typeDefs');

const resolvers = require('./resolvers');

const configurarGraphQL = async (app) => {

  const servidor = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: false, // Necessário false se for testar upload de outros domínios sem cabeçalho específico, mas pode deixar true se o client enviar o cabeçalho Apollo-Require-Preflight. O ApolloClient faz isso.
  });

  await servidor.start();

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 }),
    expressMiddleware(servidor, {

    context: async ({ req }) => {

      const contexto = { usuario: null };

      const headerAuth = req.headers.authorization;

      if (headerAuth && headerAuth.startsWith('Bearer ')) {

        try {

          const token = headerAuth.split(' ')[1];
          const decodificado = jwt.verify(token, process.env.JWT_SECRET);

          const usuario = await Usuario.findById(decodificado.id);

          if (usuario && usuario.ativo) {
            contexto.usuario = usuario;
          }
        } catch (erro) { }
      }
      return contexto;
    },
  })
  );

  console.log('GraphQL disponível em: /graphql');
};

module.exports = configurarGraphQL;
