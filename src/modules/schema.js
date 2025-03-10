import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { Query, Mutation } from "./fields.js";


export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        fields: Query
    }),
    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: Mutation
    })
})
