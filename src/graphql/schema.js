const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Transaction {
    _id: ID
    userId: String
    type: String
    value: Float
    category: String
    description: String
    date: String
  }

  input TransactionInput {
    type: String!
    value: Float!
    category: String!
    description: String
    date: String!
  }

  type Query {
    getTransactions: [Transaction]
  }

  type Mutation {
    createTransaction(input: TransactionInput): Transaction
  }
`);

module.exports = schema;