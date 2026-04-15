const express = require("express");
const path = require("path");
const conectdb = require("./src/config/db");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./src/graphql/schema");
const resolvers = require("./src/graphql/resolvers");
const auth = require("./src/middlewares/auth");

const userRoutes = require("./src/routes/userRoutes");
const financeRoutes = require("./src/routes/financeRoutes");

const app = express();

// Conexão com banco
conectdb();

// Middleware para ler JSON
app.use(express.json());

// Servir arquivos do front-end
app.use(express.static(path.join(__dirname, "public")));

// Rota GraphQL protegida
app.use(
  "/graphql",
  auth,
  graphqlHTTP((req) => ({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
    context: { userId: req.userId },
  }))
);

// Rotas REST
app.use("/users", userRoutes);
app.use("/finance", financeRoutes);

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});