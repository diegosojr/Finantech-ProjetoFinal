const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");

const FixedExpenseType = new GraphQLObjectType({
  name: "FixedExpense",
  fields: {
    _id: { type: GraphQLString },
    userId: { type: GraphQLString },
    category: { type: GraphQLString },
    description: { type: GraphQLString },
    value: { type: GraphQLFloat },
    date: { type: GraphQLString },
    paid: { type: GraphQLString }
  }
});

const MonthlySummaryType = new GraphQLObjectType({
  name: "MonthlySummary",
  fields: {
    receitas: { type: GraphQLFloat },
    despesas: { type: GraphQLFloat },
    despesasFixas: { type: GraphQLFloat },
    saldo: { type: GraphQLFloat },
    fixedExpensesList: { type: new GraphQLList(FixedExpenseType) }
  }
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    monthlySummary: {
      type: MonthlySummaryType,
      args: {
        startDate: { type: new GraphQLNonNull(GraphQLString) },
        endDate: { type: new GraphQLNonNull(GraphQLString) }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQueryType
});